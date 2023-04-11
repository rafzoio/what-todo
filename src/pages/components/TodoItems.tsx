import { type NextPage } from "next";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { api } from "../../utils/api";

const TodoItems: NextPage = ({}) => {
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
      {todos?.map((todo, index) => {
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

export default TodoItems;
