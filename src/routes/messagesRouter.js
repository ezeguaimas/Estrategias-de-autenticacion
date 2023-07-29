import { Router } from "express";
import MessagesManager from "../dao/managers/messagesManager.js";

const messagesManager = new MessagesManager();
const router = Router();

router.get("/", async (req, res) => {
  try {
    const messages = await messagesManager.getMessages();
    res.status(200).send({ messages });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/", async (req, res) => {
  try {
    const { user, message } = req.body;
    const newMessage = await messagesManager.sendMessage(user, message);
    res.status(200).send({ message: newMessage });
  } catch (error) {
    res.status(500).send(error);
  }
});

export default router;