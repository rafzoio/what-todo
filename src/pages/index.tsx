import { type todo } from "@prisma/client";
import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { Toaster } from "react-hot-toast";
import { api } from "../utils/api";
import AddTodo from "./components/AddTodo";

const Home: NextPage = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <main></main>;
  }

  const TodoItems = () => {
    const { data: todos, isLoading } = api.todo.getAll.useQuery();

    const utils = api.useContext();

    const { mutate: doneMutation } = api.todo.toggleTodo.useMutation({
      onMutate: async ({ id, isDone }) => {
        await utils.todo.getAll.cancel();
        utils.todo.getAll.setData(undefined, (todos) =>
          todos?.map((todo) =>
            todo.id === id ? { ...todo, isDone: !isDone } : todo
          )
        );
      },
      onSettled: async () => {
        await utils.todo.getAll.invalidate();
      },
    });

    const { mutate: deleteMutation } = api.todo.deleteTodo.useMutation({
      onMutate: async (deletedId) => {
        await utils.todo.getAll.cancel();
        utils.todo.getAll.setData(undefined, (todos) =>
          todos?.filter((todo) => todo.id !== deletedId)
        );
        toast.success("Todo deleted");

        const prev = utils.todo.getAll.getData();
        return { prev };
      },
      onSettled: async () => {
        await utils.todo.getAll.invalidate();
      },
    });

    if (isLoading) return <div>Fetching messages...</div>;

    return (
      <div className="flex flex-col gap-4 p-2">
        {todos?.map((todo: todo, index) => {
          return (
            <div
              className="flex transform flex-row items-center 
                  gap-4 text-2xl transition-transform duration-200 hover:translate-x-2"
              key={index}
            >
              <p
                className={`cursor-pointer ${
                  todo.isDone ? "text-green-700" : ""
                }`}
                onClick={() => {
                  doneMutation({ id: todo.id, isDone: todo.isDone });
                }}
              >
                {todo.name}
              </p>

              <Image
                onClick={() => {
                  deleteMutation(todo.id);
                }}
                className="pt-1"
                src="/delete.svg"
                alt="White cross delete icon"
                width={24}
                height={24}
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <main className="flex flex-col items-center">
      <Toaster position="bottom-right" />
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
            <AddTodo status={status} />
            <TodoItems />
          </>
        )}
      </div>
    </main>
  );
};

export default Home;
