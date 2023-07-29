import express from "express";
import ProductManager from "../dao/managers/productManagerFS.js";
import { updatedProducts } from "../utils/socketUtilsFS.js";


const router = express.Router();
const productManager = new ProductManager();

router.get("/", async (req, res) => {
  try {
    const limit = req.query.limit;
    const products = await productManager.getProducts();

    if (limit) {
      const limitedProducts = products.slice(0, limit);
      res.status(200).json(limitedProducts);
    } else {
      res.status(200).json(products);
    }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los productos" });
  }
});

router.get("/:pid", (req, res) => {
  try {
    const productId = req.params.pid;
    const product = productManager.getProductById(productId);

    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ error: "Producto no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el producto" });
  }
});

router.post("/", async (req, res) => {
  try {
    const product = req.body;
    productManager.addProduct(product);
    res.status(201).json({ message: "Producto agregado exitosamente" });
    updatedProducts();
  } catch (error) {
    res.status(500).json({ error: "Error al agregar el producto" });
  }
});

router.put("/:pid", async (req, res) => {
  try {
    const productId = req.params.pid;
    const updatedFields = req.body;
    const result = await productManager.updateProduct(productId, updatedFields);

    if (result === "Error: Producto no encontrado") {
      res.status(404).json({ error: result });
    } else {
      res.status(200).json({ message: "Producto modificado exitosamente" });
      updatedProducts();
    }
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    const productId = req.params.pid;
    const result = productManager.deleteProduct(productId);

    if (result === "Error: Producto no encontrado") {
      res.status(404).json({ error: result });
    } else {
      res.status(200).json({ message: "Producto eliminado exitosamente" });
      updatedProducts();
    }
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
});

export default router;
