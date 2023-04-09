import { type todo } from "@prisma/client";
import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { api } from "../utils/api";

const Home: NextPage = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <main>Loading...</main>;
  }

  const TodoItems = () => {
    const { data: todos, isLoading } = api.todo.getAll.useQuery();

    const utils = api.useContext();

    const doToggle = api.todo.toggleTodo.useMutation({
      onMutate: async (updatedTodo: todo) => {
        await utils.todo.getAll.cancel();
        utils.todo.getAll.setData(undefined, (todos) =>
          todos?.map((todo) =>
            todo.id === updatedTodo.id
              ? { ...todo, isDone: !todo.isDone }
              : todo
          )
        );
      },
      onSettled: async () => {
        await utils.todo.getAll.invalidate();
      },
    });

    if (isLoading) return <div>Fetching messages...</div>;

    return (
      <div className="flex flex-col gap-4 p-2">
        {todos?.map((todo, index) => {
          return (
            <div
              className="flex transform flex-row 
                  gap-4 text-2xl transition-transform duration-200 hover:translate-x-2"
              key={index}
            >
              <p
                className={`cursor-pointer ${
                  todo.isDone ? "text-green-700" : ""
                }`}
                onClick={() => {
                  doToggle.mutate(todo);
                }}
              >
                {todo.name}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  const NewTodo = () => {
    const [name, setName] = useState("");

    const utils = api.useContext();
    const postMessage = api.todo.postTodo.useMutation({
      onMutate: async (newTodo: todo) => {
        await utils.todo.getAll.cancel();
        utils.todo.getAll.setData(undefined, (todos) => {
          if (todos) {
            return [newTodo, ...todos];
          } else {
            return [newTodo];
          }
        });
      },
      onSettled: async () => {
        await utils.todo.getAll.invalidate();
      },
    });

    if (status !== "authenticated") return null;

    return (
      <div className="flex justify-center">
        <form
          className="flex items-end gap-1"
          onSubmit={(event) => {
            event.preventDefault();
            postMessage.mutate({
              name: name,
              isDone: false,
            });
            setName("");
          }}
        >
          <input
            type="text"
            className="rounded-md border-2 border-white bg-neutral-900 px-4 py-2 hover:border-zinc-500"
            placeholder="New todo..."
            minLength={2}
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <button
            type="submit"
            className="rounded-md border-2 border-white p-2 hover:border-zinc-500"
          >
            Submit
          </button>
        </form>
      </div>
    );
  };

  return (
    <main className="flex flex-col items-center">
      <h1 className="pt-4 text-8xl">WhatToDo</h1>
      <div className="pt-4">
        <div>
          {session ? (
            <>
              <div className="inline-block">
                <div className="group relative flex flex-row items-center">
                  <p className="mb-4 text-center">hi {session.user?.name}</p>
                  <button
                    type="button"
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform rounded bg-neutral-500 px-3 py-1 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    onClick={() => {
                      signOut().catch(console.log);
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <button
              type="button"
              className="mx-auto block rounded-md bg-neutral-800 px-6 py-3 text-center hover:bg-neutral-700"
              onClick={() => {
                signIn("discord").catch(console.log);
              }}
            >
              Login with Discord
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-5 pt-5 ">
        {session && (
          <>
            <NewTodo />
            <TodoItems />
          </>
        )}
      </div>
    </main>
  );
};

export default Home;
