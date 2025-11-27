import express from "express";
import { signup, login, logout, updateProfile } from "../controller/auth.controller.js";
import { protectedRoute } from '../middleware/auth.middleware.js';

const route = express.Router();

route.post("/signup", signup);

route.post("/login", login);

route.post("/logout", logout);

route.post("/update-profile", protectedRoute ,updateProfile);

route.get("/check", protectedRoute, (req, res) => {
  return res.status(200).json(req.user);
});

export default route;