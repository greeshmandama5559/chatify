import express from 'express';
import { signup } from '../controller/auth.controller.js';

const route = express.Router();

route.post('/signup', signup);

route.get('/login', (req, res) => {
    res.send("this is login endpoint");
});

route.get('/logout', (req, res) => {
    res.send("this is logout endpoint");
});

export default route;