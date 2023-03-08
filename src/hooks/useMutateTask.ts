import useStore from "../store"
import { trpc } from "../utils/trpc"

export default function useMutateTask() {
  const utils = trpc.useContext() // cacheにアクセスしたい
  const reset = useStore((state) => state.resetEditedTask);
  const createTaskMutation = trpc.todo.createTask.useMutation({
    onSuccess: (res) => {
      const previousTodos = utils.todo.getTasks.getData() // 既存のtaskのcacheデータを取得
      if(previousTodos){
        utils.todo.getTasks.setData([res, ...previousTodos]);
      }
      reset()
    }
  })
  const updateTaskMutation = trpc.todo.updateTask.useMutation({
    onSuccess: (res) => {
      const previousTodos = utils.todo.getTasks.getData() // 既存のtaskのcacheデータを取得
      if(previousTodos){
        utils.todo.getTasks.setData(
          previousTodos.map((task) => (task.id === res.id ? res : task)) // cacheと更新したデータが一致したtaskは新しいデータに置き換える
        )
      }
      reset()
    }
  })
  // serverサイドで書いたdeleteTaskをリモートプレシーじゃコールで呼び出す
  const deleteTaskMutation = trpc.todo.deleteTask.useMutation({
    onSuccess: (_, variables) => {// deleteTaskに渡されたinputの引数の値にアクセスできる
      const previousTodos = utils.todo.getTasks.getData() // 既存のtaskのcacheデータを取得
      if(previousTodos){
        utils.todo.getTasks.setData(
          previousTodos.filter((task) => (task.id === variables.taskId))
        )
      }
      reset()
    }
  })
  return {
    createTaskMutation, updateTaskMutation, deleteTaskMutation
  }
}
