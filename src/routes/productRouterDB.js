import express from "express";
import ProductManager from "../dao/managers/productManagerDB.js";
const router = express.Router();

const productManager = new ProductManager();

router.get("/", async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, category, available } = req.query;
    const baseUrl = `${req.protocol}://${req.get("host")}${
      req.originalUrl.split("?")[0]
    }`;
    const products = await productManager.getProducts(
      limit,
      page,
      sort,
      category,
      available,
      baseUrl
    );
    res.send({ status: 1, ...products });
  } catch (error) {
    res.status(500).send({ status: 0, msg: error.message });
  }
});

router.get("/:pid", productManager.getProductById);

router.post("/", productManager.addProduct);

router.put("/:pid", productManager.updateProduct);

router.delete("/:pid", productManager.deleteProduct);

router.post("/upload", productManager.uploadProducts);

export default router;
