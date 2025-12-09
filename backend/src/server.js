import express from 'express';
import ENV from './ENV.js';
import authRouter from './routes/auth.route.js';
import messageRouter from './routes/message.route.js';
import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';
import cors from "cors";
import { app, server } from './lib/socket.js';
import passport from "passport";
import "./utils/passport.js";

app.use(cors({
  origin: ENV.CLIENT_URL,   // Your Vercel frontend URL
  credentials: true
}));

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));
app.use(cookieParser());

app.use(passport.initialize());

const PORT = ENV.PORT || 3000;

app.use('/api/auth', authRouter);
app.use('/api/messages', messageRouter);

server.listen(PORT, () => {
    connectDB();
    console.log(`server is running on port ${PORT}...`);
});