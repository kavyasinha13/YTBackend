
import {Router} from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router()

router.route("/register").post(registerUser)

router.get("/ping", (req, res) => {
  res.send("Pong from /api/v1/users/ping");
});

export default router