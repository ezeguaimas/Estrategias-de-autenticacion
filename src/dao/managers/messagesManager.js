import messagesModel from "../models/messagesModel.js";

class MessagesManager {
  async getMessages() {
    try {
      const messages = await messagesModel.find();
      return messages;
    } catch (error) {
      throw new Error({ error: "Error al obtener los mensajes" });
    }
  }

  async sendMessage(user, message) {
    try {
      const newMessage = await messagesModel.create({ user, message });
      return newMessage;
    } catch (error) {
      throw new Error(`Error al enviar el mensaje: ${error.message}`);
    }
  }
}
export default MessagesManager;
