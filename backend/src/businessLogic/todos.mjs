import * as uuid from 'uuid'
import { TodosAccess } from "../dataLayer/todosAccess.mjs";
import { createLogger } from '../utils/logger.mjs'
import { AttachmentUtils } from "../fileStorage/attachmentUtils.mjs";

// TODO: Implement businessLogic
const logger = createLogger("Todos");
const todosAccess = new TodosAccess();
const attachmentUtils = new AttachmentUtils();

// Get all todos by userId
export async function getTodosForUser(userId) {
    logger.info("Call function getall todos");
    return await todosAccess.getAll(userId);
}

// Create todo
export async function createTodo(createTodoRequest, userId) {
    logger.info("Call function create todo");

    const toDoId = uuid.v4()
    const createdAt = new Date().toISOString();
    const s3AttachUrl = attachmentUtils.getAttachmentUrl(toDoId);
    const todoItem = {
        todoId: toDoId,
        userId: userId,
        createdAt,
        done: false,
        attachmentUrl: null,
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate
    }

    return await todosAccess.createTodo(todoItem);
}

// Update todo
export async function updateTodo(userId, toDoId, updateToDoRequest) {
    logger.info("Call function update todo");

    return await todosAccess.updateTodo(userId, toDoId, updateToDoRequest);
}


// Delete todo
export async function deleteTodo(userId, toDoId) {
    logger.info("Call function delete todo");

    return await todosAccess.deteteTodo(userId, toDoId);
}

// General updateAttachmentPresignedUrl
export async function updateAttachmentPresignedUrl(userId, toDoId) {
    logger.info("Call function updateAttachmentPresignedUrl");

    return await todosAccess.updateAttachmentPresignedUrl(userId, toDoId);
}