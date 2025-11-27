import express from 'express';
import ENV from './ENV.js';
import path from 'path';
import authRouter from './routes/auth.route.js';
import messageRouter from './routes/message.route.js';
import { connectDB } from './lib/db.js';

const app = express();

app.use(express.json());

const PORT = ENV.PORT || 3000;

app.use('/api/auth', authRouter);
app.use('/api/message', messageRouter)

const __dirname = path.resolve();
if(ENV.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, '../frontend/dist')));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
    })
}

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}...`);
    connectDB();
})