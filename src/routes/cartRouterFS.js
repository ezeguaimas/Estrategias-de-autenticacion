import express from "express";
import CartManager from "../dao/managers/cartManagerFS.js";

const router = express.Router();
const cartManager = new CartManager();

router.post("/", (req, res) => {
  try {
    const cart = cartManager.createCart();
    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el carrito" });
  }
});

router.get("/:cid", (req, res) => {
  try {
    const cartId = req.params.cid;
    const cart = cartManager.getCartById(cartId);

    if (cart) {
      res.status(200).json(cart);
    } else {
      res.status(404).json({ error: "Carrito no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el carrito" });
  }
});

router.post("/:cid/product/:pid", (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const result = cartManager.addProductToCart(cartId, productId);

    if (result.error) {
      res.status(400).json({ error: result.error });
    } else {
      res.status(200).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: "Error al agregar el producto al carrito" });
  }
});

export default router;
