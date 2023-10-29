import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { updateTodo } from '../../businessLogic/todos.mjs'
import { getUserId } from '../utils.mjs'

// TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    console.log('Processing event: ', event)

    const todoId = event.pathParameters.todoId
    const updatedTodo = JSON.parse(event.body)

    const userId = getUserId(event)

    const updateItem = await updateTodo(userId, todoId, updatedTodo)

    return {
      statusCode: 204,
      body: JSON.stringify({
        updateItem
      })
    }
  })
