import express from "express";
import handlebars from "express-handlebars";
import productRouter from "./routes/productRouterDB.js";
import productRouterFS from "./routes/productRouterFS.js";
import cartRouter from "./routes/cartRouterDB.js";
import cartRouterFS from "./routes/cartRouterFS.js";
import viewsRouter from "./routes/viewsRouterDB.js";
import viewsRouterFS from "./routes/viewsRouterFS.js";
import messagesRouter from "./routes/messagesRouter.js";
import __dirname from "./utils/utils.js";
import path from "path";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import { MONGO, SESSION_SECRET } from "./utils/mongoDBConfig.js";
import { updatedProducts, chat } from "./utils/socketUtils.js";
import displayRoutes from "express-routemap";
import session from "express-session";
import MongoStore from "connect-mongo";
import sessionsRouter from "./routes/sessionsRouter.js";
import passport from "passport";
import initializePassport from "./config/passportConfig.js";

const port = 8080;

// Inicializar express
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Iniciar el servidor
const httpServer = app.listen(port, () => {
  displayRoutes(app);
  console.log(`Servidor iniciado en el puerto ${port}`);
});

// Conexión a la base de datos
mongoose.connect(MONGO, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// const enviroment = async () => {
//   mongoose.connect(MONGO)
// };
// enviroment();

// Sessions
app.use(
  session({
    store: new MongoStore({
      mongoUrl: MONGO,
      ttl: 3600,
    }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
initializePassport();
app.use(passport.initialize());
app.use(passport.session());

// Inicializar handlebars
app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

// Middleware para contenido estático
app.use(express.static(path.join(__dirname + "./public")));

// Rutas
app.use("/api/products", productRouter);
app.use("/api/fs/products", productRouterFS);

app.use("/api/carts", cartRouter);
app.use("/api/fs/carts", cartRouterFS);

app.use("/api/messages", messagesRouter);

app.use("/", viewsRouter);
app.use("/fs", viewsRouterFS);

app.use("/api/sessions", sessionsRouter);

// Inicializar socket.io
const io = new Server(httpServer);

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Nueva conexión websocket", socket.id);
  updatedProducts(io);
  chat(socket, io);

  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
});
