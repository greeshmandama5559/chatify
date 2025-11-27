import express from 'express';
import dotenv from 'dotenv';
import authRouter from './routes/auth.route.js';
import messageRouter from './routes/message.route.js';

const app = express();

app.use(express.json());

dotenv.config();

app.get('/', (req, res) => {
    res.send("backend is running.");
});

app.use('/api/auth', authRouter);
app.use('/api/message', messageRouter)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`server is running on port ${PORT}...`))