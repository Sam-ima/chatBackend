import express from "express";
import { getMessages, sendMessage } from "../controllers/message.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/:id", protectRoute, getMessages);  //protectRoute is like authorization if registered or not
router.post("/send/:id", protectRoute, sendMessage);

export default router;