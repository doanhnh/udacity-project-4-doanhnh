import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { updateAttachmentPresignedUrl } from '../../businessLogic/todos.mjs'
import { getUserId } from '../utils.mjs'

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
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
    const userId = getUserId(event)

    const url = await updateAttachmentPresignedUrl(userId, todoId)

    return {
      statusCode: 201,
      body: JSON.stringify({
        uploadUrl: url
      })
    }
  })
