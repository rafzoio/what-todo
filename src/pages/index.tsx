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
      <div className="pt-4">
        <div>
          {session ? (
            <>
              <div className="inline-block">
                <div className="group relative flex flex-row items-center px-2 ">
                  <h1 className="pt-4 text-7xl">What To Do...</h1>
                  <button
                    type="button"
                    className="-translate-x-1/2 -translate-y-1/2 transform rounded bg-neutral-500 px-3 py-1 text-white opacity-40 transition-opacity duration-200 group-hover:opacity-100"
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
            <div>
              <h1 className="p-4 text-7xl">What To Do...</h1>
              <button
                type="button"
                className="mx-auto block rounded-md bg-neutral-500 px-6 py-3 text-center text-white hover:bg-neutral-700"
                onClick={() => {
                  signIn("discord").catch(console.log);
                }}
              >
                Login with Discord
              </button>
            </div>
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
