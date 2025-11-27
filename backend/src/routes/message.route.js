import express from 'express';

const message = express.Router();

message.get('/send', (req, res) => {
    res.send("sending a message...");
});

export default message;