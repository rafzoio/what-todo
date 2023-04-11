import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import AddTodo from "./components/AddTodo";
import TodoItems from "./components/TodoItems";

const Home: NextPage = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <main></main>;
  }

  return (
    <main className="flex flex-col items-center">
      <Toaster position="bottom-right" />
      <h1 className="border-b-2 pt-4 text-8xl">WhatToDo</h1>
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
            <AddTodo />
            <TodoItems />
          </>
        )}
      </div>
    </main>
  );
};

export default Home;
