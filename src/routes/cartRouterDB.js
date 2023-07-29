import express from "express";
import CartManager from "../dao/managers/cartManagerDB.js";
import cartsModel from "../dao/models/cartModel.js";
const router = express.Router();

const cartManager = new CartManager();

router.get("/", cartManager.getCart);

router.post("/", cartManager.createCart);

router.get("/:cid", async (req, res) => {
  try {
    const carts = await cartsModel.findById(req.params.cid);

    return res.status(200).send(carts);
  } catch (error) {
    return res.status(500).send({ error: "Error al obtener el carrito" });
  }
});

router.post("/:cid/product/:pid", cartManager.addProduct);

router.put("/:cid/product/:pid", cartManager.updateQuantity);

router.put("/:cid", cartManager.addProductsToCart);

router.delete("/:cid/product/:pid", cartManager.deleteProduct);

router.delete("/:cid", cartManager.deleteProductsFromCart);

export default router;
