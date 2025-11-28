import express from 'express';
import { protectedRoute } from '../middleware/auth.middleware.js';
import { arcjetProtection } from '../middleware/arcjet.middleware.js'
import { getAllContacts, getMessagesByUserId, sendMessage, getAllChats} from '../controller/message.controller.js'

const message = express.Router();

message.use(arcjetProtection, protectedRoute);

message.get('/contacts', getAllContacts);
message.get('/chats', getAllChats);
message.get('/:id', getMessagesByUserId);
message.post('/send/:id', sendMessage);

export default message;