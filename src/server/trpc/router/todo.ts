import {
  createTaskSchema,
  getSingleTaskSchema,
  updateTaskSchema,
  deleteTaskSchema,
} from '../../../schema/todo'

import { t, authedProcedure } from '../trpc'

export const todoRouter = t.router({
  createTask: authedProcedure.input(createTaskSchema).mutation(
    async ({ctx, input}) => {
      const task = await ctx.prisma.task.create({ // task table
        data: {
          ...input, // schema inputで受け取る渡ってくるinput
          user: {
            connect: { // 既存の損際するレコードに関連づけたいときに使用する
              id: ctx.session?.user?.id, // userレコードのidに関連づける
            }
          }
        }
      })
      return task
    }
  ), // 認証を通っている人だけが呼ぶことができる
  getTasks: t.procedure.query(({ ctx}) => { // githubの認証が不要にしたい場合はt.procedure
    return ctx.prisma.task.findMany({
      where: {
        userId: ctx.session?.user?.id, // ログインしているユーザー自身が作ったっタスクと一致する場合という条件
      },
      orderBy: {
        createdAt: "desc" // 作成された日時が新しいものから古いものにする
      }
    })
  }),
  getSingleTask: authedProcedure.input(getSingleTaskSchema).query(({ctx, input}) => {
    return ctx.prisma.task.findUnique({
      where: {
        id: input.taskId
      }
    })
  }),
  updateTask: authedProcedure.input(updateTaskSchema).mutation(async ({ctx, input }) => {
    const task = await ctx.prisma.task.update({
      where: {
        id: input.taskId
      },
      data: {
        title: input.title,
        body: input.body
      }
    })
    return task;
  }),
  deleteTask: authedProcedure.input(deleteTaskSchema).mutation(async ({ctx, input }) => {
    const task = await ctx.prisma.task.delete({
      where: {
        id: input.taskId
      },
    })
    return task
  })
})