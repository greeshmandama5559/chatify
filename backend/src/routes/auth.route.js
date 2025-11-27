import express from 'express';

const route = express.Router();

route.get('/signup', (req, res) => {
    res.send("this is signup endpoint");
});

route.get('/login', (req, res) => {
    res.send("this is login endpoint");
});

route.get('/logout', (req, res) => {
    res.send("this is logout endpoint");
});

export default route;