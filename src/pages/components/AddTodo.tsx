import { type todo } from "@prisma/client";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { api } from "../../utils/api";

const AddTodo: NextPage = () => {
  const [name, setName] = useState("");
  const { status } = useSession();
  const utils = api.useContext();
  const { mutate: postMutation } = api.todo.postTodo.useMutation({
    onMutate: async (name) => {
      await utils.todo.getAll.cancel();
      utils.todo.getAll.setData(undefined, (prev) => {
        const optimisticTodo: todo = {
          id: "optimistic-todo-id",
          createdAt: new Date(),
          name: name,
          isDone: false,
        };
        if (!prev) return [optimisticTodo];
        return [optimisticTodo, ...prev];
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
          postMutation(name);
          setName("");
        }}
      >
        <input
          type="text"
          className="rounded-md border-2 border-white bg-neutral-900 px-4 py-2 text-white hover:border-zinc-500"
          placeholder="Something to do..."
          minLength={2}
          maxLength={30}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button
          type="submit"
          className="rounded-md border-2 border-white bg-neutral-900 px-4 py-2 text-white  hover:bg-slate-700"
        >
          Add
        </button>
      </form>
    </div>
  );
};

export default AddTodo;
