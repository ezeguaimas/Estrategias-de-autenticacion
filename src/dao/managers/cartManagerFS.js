import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import ProductManager from "../managers/productManagerFS.js";

const productManager = new ProductManager();

const { readFileSync, writeFileSync } = fs;

const cartFilePath = "src/dao/data/carrito.json";

export default class CartManager {
  constructor() {
    this.cartFilePath = cartFilePath;
    this.cart = this.getCart();
  }

  getCart() {
    try {
      const data = readFileSync(this.cartFilePath, "utf8");
      const cart = JSON.parse(data);
      return cart;
    } catch (error) {
      return [];
    }
  }

  saveCart() {
    try {
      writeFileSync(this.cartFilePath, JSON.stringify(this.cart, null, 2));
    } catch (error) {
      throw new Error("Error al guardar el carrito");
    }
  }

  createCart() {
    const cartId = uuidv4(); // Generador de ID único para cada carrito
    const cart = {
      id: cartId,
      products: [],
    };
    this.cart.push(cart);
    this.saveCart();
    return cart;
  }

  getCartById(cartId) {
    const cart = this.cart.find((cart) => cart.id === cartId);
    return cart;
  }

  addProductToCart(cartId, productId) {
    const cart = this.getCartById(cartId);
    if (!cart) {
      return { error: "Carrito no encontrado" };
    }

    const product = productManager.getProductById(productId);
    if (!product) {
      return { error: "El producto que intenta agregar al carrito no existe" };
    }

    const existingProduct = cart.products.find(
      (product) => product.id === productId
    );
    if (!existingProduct) {
      cart.products.push({ id: productId, quantity: 1 });
    } else {
      existingProduct.quantity += 1;
    }

    this.saveCart();
    return cart;
  }
}
