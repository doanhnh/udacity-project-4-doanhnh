import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import AWSXRay from 'aws-xray-sdk-core'
import { createLogger } from '../utils/logger.mjs'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

// TODO: Implement dataLayer
const logger = createLogger("TodoAccess");
const url_expiration = process.env.SIGNED_URL_EXPIRATION;

export class TodosAccess {
    constructor(
        documentClient = AWSXRay.captureAWSv3Client(new DynamoDB()),
        S3 = new S3Client(),
        todosTable = process.env.TODOS_TABLE,
        todosIndex = process.env.TODOS_CREATED_AT_INDEX,
        s3_bucket_name = process.env.ATTACHMENT_S3_BUCKET
    ) {
        this.documentClient = documentClient
        this.S3 = S3;
        this.todosTable = todosTable
        this.todosIndex = todosIndex
        this.dynamoDbClient = DynamoDBDocument.from(this.documentClient)
        this.bucket_name = s3_bucket_name
    }

    // Get all todo
    async getAll(userId) {
        logger.info("Call function getAll");

        const result = await this.dynamoDbClient.query({
            TableName: this.todosTable,
            IndexName: this.todosIndex,
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
            ":userId": userId,
            },
        })
        return result.Items
    }

    // Create toDo
    async createTodo(todo) {
        logger.info("Call function createTodo");
        console.log('Item todo', todo)

        await this.dynamoDbClient.put({
            TableName: this.todosTable,
            Item: todo,
        });

        return todo;
    }

    // update Todo
    async updateTodo(userId, toDoId, updateToDoRequest) {
        logger.info("Call function updateTodo");

        try {
            await this.dynamoDbClient.update({
                TableName: this.todosTable,
                Key: {
                    userId,
                    toDoId,
                },
                UpdateExpression:
                    "set #name = :name, #dueDate = :dueDate, #done = :done",
                ExpressionAttributeNames: {
                    "#name": "name",
                    "#dueDate": "dueDate",
                    "#done": "done",
                },
                ExpressionAttributeValues: {
                    ":name": updateToDoRequest.name,
                    ":dueDate": updateToDoRequest.dueDate,
                    ":done": updateToDoRequest.done,
                },
                ReturnValues: "UPDATED_NEW",
            });

            return updateToDoRequest;
        } catch (e) {
            return "Error";
        }
    }

    // Delete Todo
    async deteteTodo(userId, toDoId) {
        logger.info("Call function deleteTodo");

        try {
            await this.dynamoDbClient.delete({
                TableName: this.todosTable,
                Key: {
                    userId,
                    toDoId,
                },
            });

            return "Success";
        } catch (e) {
            return "Error";
        }
    }

    // Update updateAttachmentPresignedUrl
    async updateAttachmentPresignedUrl(userId, toDoId) {
        logger.info("Call function updateAttachmentPresignedUrl");

        try {

            const uploadUrl = this.S3.getSignedUrl("putObject", {
                Bucket: this.bucket_name,
                Key: toDoId,
                Expires: Number(url_expiration),
            });
            await this.dynamoDbClient
            .update({
                TableName: this.todosTable,
                Key: {
                userId,
                toDoId,
                },
                UpdateExpression: "set attachmentUrl = :URL",
                ExpressionAttributeValues: {
                ":URL": uploadUrl.split("?")[0],
                },
                ReturnValues: "UPDATED_NEW",
            });

            return uploadUrl;
            
        } catch (e) {
            return "Error";
        }
    }
}