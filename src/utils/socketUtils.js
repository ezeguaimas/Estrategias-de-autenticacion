//import productManagerDB from "../dao/managers/productManagerDB.js";
import MessagesManager from "../dao/managers/messagesManager.js";
import productsModel from "../dao/models/productsModel.js";

const messageManager = new MessagesManager();

const updatedProducts = async (io) => {
  const products = await productsModel.find();
  //const products = await productManagerDB.getProducts();
  io.emit("updatedProducts", products);
};

const chat = async (socket, io) => {
  socket.on("authenticated", async (data) => {
    const messages = await messageManager.getMessages();
    socket.emit("messageLogs", messages); //Emite solo al creador de la conexión
    socket.broadcast.emit("newUserConnected", data); //Notifica a todos excepto al creador de la conexión
  });

  socket.on("message", async (data) => {
    const { user, message } = data;
    const newMessage = await messageManager.sendMessage(user, message);
    const messages = await messageManager.getMessages();
    io.emit("messageLogs", messages); //Emite a todos
  });
};

export { updatedProducts, chat };
