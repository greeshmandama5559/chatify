import express from 'express';
import ENV from './ENV.js';
import authRouter from './routes/auth.route.js';
import messageRouter from './routes/message.route.js';
import { connectDB } from './lib/db.js';
import cors from "cors";
import { app, server } from './lib/socket.js';
import path from "path";
import profile from './routes/profile.route.js';

app.use(cors({
  origin: ENV.CLIENT_URL, 
}));

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

const PORT = ENV.PORT || 3000;

app.use('/api/auth', authRouter);
app.use('/api/messages', messageRouter);
app.use('/api/profile', profile);

// const __dirname = path.resolve();

// if (ENV.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../frontend/dist")));

//   app.get("*", (_, res) => {
//     res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
//   });
// }

server.listen(PORT, () => {
    connectDB();
    console.log(`server is running on port ${PORT}...`);
});