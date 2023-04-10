import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const todoRouter = createTRPCRouter({
  postTodo: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.todo.create({
          data: {
            name: input,
            isDone: false,
          },
        });
      } catch (error) {
        console.log(error);
      }
    }),
  toggleTodo: protectedProcedure
  .input(
      z.object({
        id: z.string(),
        isDone: z.boolean(),
      })
    )
  .mutation(async ({ctx, input}) => {
    try {
      await ctx.prisma.todo.update({
        data: {
          isDone: !input.isDone,
        },
        where: {
          id: input.id,
        }
      })
    } catch (error) {
      console.log("error", error);
    }
  }),
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        return await ctx.prisma.todo.findMany({
          select: {
            id: true,
            createdAt: true,
            name: true,
            isDone: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        })
      } catch (error) {
        console.log("error")
        }
    }),
    deleteTodo: protectedProcedure
    .input(z.string())
    .mutation(async ({ctx, input}) => {
      try {
        return await ctx.prisma.todo.delete({
          where: {
            id: input
          }})
        } catch (error) {
          console.log("error", error);
        }
      })
});