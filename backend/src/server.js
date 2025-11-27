import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import authRouter from './routes/auth.route.js';
import messageRouter from './routes/message.route.js';

const app = express();

app.use(express.json());

dotenv.config();
const PORT = process.env.PORT || 3000;

app.use('/api/auth', authRouter);
app.use('/api/message', messageRouter)

const __dirname = path.resolve();
if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, '../frontend/dist')));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
    })
}

app.listen(PORT, () => console.log(`server is running on port ${PORT}...`))