import express from 'express';
import { protectedRoute } from '../middleware/auth.middleware.js';
import { arcjetProtection } from '../middleware/arcjet.middleware.js'
import { getAllContacts, getTrendingUsers, getMessagesByUserId, sendMessage, getAllChats, deleteMessage, getUnseenCounts } from '../controller/message.controller.js'

const message = express.Router();

message.use(arcjetProtection, protectedRoute);

message.get('/contacts', getAllContacts);
message.get('/chats', getAllChats);
message.get('/unseen-counts', getUnseenCounts);
message.get('/trending-users', getTrendingUsers);
message.get('/:id', getMessagesByUserId);
message.post('/send/:id', sendMessage);
message.delete("/delete/:id", deleteMessage);


export default message;