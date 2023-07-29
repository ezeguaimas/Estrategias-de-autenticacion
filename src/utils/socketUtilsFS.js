import ProductManager from "../dao/managers/productManagerFS.js";

export async function updatedProducts() {
  const productManager = new ProductManager();
  const products = await productManager.getProducts();
  io.emit("updatedProducts", products);
}
