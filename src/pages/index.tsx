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
    const { data: todoItems, isLoading } = api.todo.getAll.useQuery();

    const toggleTodo = api.todo.toggleTodo.useMutation();

    const doToggle = (todo: todo) => {
      toggleTodo.mutate({ id: todo.id, isDone: todo.isDone });
    };

    if (isLoading) return <div>Fetching messages...</div>;

    return (
      <div className="flex flex-col gap-4">
        {todoItems?.map((todo, index) => {
          return (
            <div className="flex flex-row gap-4" key={index}>
              <p
                onClick={() => {
                  doToggle(todo);
                  !todo.isDone;
                }}
              >
                {todo.name}
              </p>
              {todo.isDone && <p> . . . done</p>}
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
      onMutate: async (newTodo) => {
        await utils.todo.getAll.cancel();
        utils.todo.getAll.setData(undefined, (todoItems) => {
          if (todoItems) {
            return [newTodo, ...todoItems];
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
      <form
        className="flex gap-2"
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
          className="rounded-md border-2 border-zinc-800 bg-neutral-900 px-4 py-2 focus:outline-none"
          placeholder="New todo..."
          minLength={2}
          maxLength={100}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button
          type="submit"
          className="rounded-md border-2 border-zinc-800 p-2 focus:outline-none"
        >
          Submit
        </button>
      </form>
    );
  };

  return (
    <main className="flex flex-col items-center">
      <h1 className="pt-4 text-5xl">WhatToDo</h1>
      <div className="pt-10">
        <div>
          {session ? (
            <>
              <p className="mb-4 text-center">hi {session.user?.name}</p>
              <button
                type="button"
                className="mx-auto block rounded-md bg-neutral-800 px-6 py-2 text-center hover:bg-neutral-700"
                onClick={() => {
                  signOut().catch(console.log);
                }}
              >
                Logout
              </button>
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
        <TodoItems />
        <NewTodo />
      </div>
    </main>
  );
};

export default Home;
