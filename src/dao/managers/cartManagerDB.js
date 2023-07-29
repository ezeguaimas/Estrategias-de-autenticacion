import cartsModel from "../models/cartModel.js";
import productsModel from "../models/productsModel.js";

class CartManagerDB {
  constructor() {
    this.cartsModel = cartsModel;
  }

  async getCart(req, res) {
    try {
      const carts = await cartsModel.find();
      return res.status(200).send(carts);
    } catch (error) {
      return res.status(500).send({ error: "Error al obtener los carritos" });
    }
  }

  async createCart(req, res) {
    try {
      const cart = await cartsModel.create({ products: [] });
      return res.status(201).send({ cart });
    } catch (error) {
      return res.status(500).send({ error: "Error al crear el carrito" });
    }
  }

  async getCartById(req, res) {
    try {
      const cartId = req.params.cid;
      const cart = await cartsModel.findById(cartId);

      if (!cart) {
        return res.status(404).send({ error: "Carrito no encontrado" });
      }
      return res.status(200).send({ cart });
    } catch (error) {
      return res.status(500).send({ error: "Error al obtener el carrito" });
    }
  }

  async addProduct(req, res) {
    try {
      const cartId = req.params.cid;
      const productId = req.params.pid;

      const cart = await cartsModel.findById(cartId);
      if (!cart) {
        return res.status(404).send({ error: "Carrito no encontrado" });
      }

      if (!productId) {
        return res
          .status(404)
          .send({ error: "El Id del producto es requerido" });
      }

      const product = await productsModel.findById(productId);
      if (!product) {
        return res.status(404).send({ error: "Producto no encontrado" });
      }

      const existingProduct = cart.products.find(
        (product) => product.product._id.toString() === productId
      );
      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        cart.products.push({ product: product, quantity: 1 });
      }
      await cart.save();
      return res.status(200).send(cart);
    } catch (error) {
      return res
        .status(500)
        .send({ error: "Error al agregar el producto al carrito" });
    }
  }

  async deleteProduct(req, res) {
    try {
      const cartId = req.params.cid;
      const productId = req.params.pid;
      const cart = await cartsModel.findOne({ _id: cartId });
      if (!cart) {
        return res.status(404).send({ error: "Carrito no encontrado" });
      }
      const existingProduct = cart.products.find(
        (product) => product.product._id.toString() === productId
      );
      if (!existingProduct) {
        return res.status(404).send({ error: "Producto no encontrado" });
      }
      const updatedCart = await cartsModel.updateOne(
        { _id: cartId },
        { $pull: { products: { product: productId } } },
        { new: true }
      );
      return res.status(200).send(updatedCart);
    } catch (error) {
      return res
        .status(500)
        .send({ error: "Error al eliminar el producto del carrito" });
    }
  }

  async deleteProductsFromCart(req, res) {
    try {
      const cartId = req.params.cid;
      const cart = await cartsModel.findOne({ _id: cartId });
      if (!cart) {
        return res.status(404).send({ error: "Carrito no encontrado" });
      }
      const updatedCart = await cartsModel.updateOne(
        { _id: cartId },
        { $set: { products: [] } },
        { new: true }
      );
      return res.status(200).send(updatedCart);
    } catch (error) {
      return res
        .status(500)
        .send({ error: "Error al eliminar los productos del carrito" });
    }
  }

  async addProductsToCart(req, res) {
    try {
      const cartId = req.params.cid;
      const products = req.body;
      const cart = await cartsModel.findById(cartId);

      if (!cart) {
        return res.status(404).send({ error: "Carrito no encontrado" });
      }
      const updatedCart = await cartsModel.updateOne(
        { _id: cartId },
        { $set: { products: products } },
        { new: true }
      );
      return res.status(200).send(updatedCart);
    } catch (error) {
      return res.status(500).send({ error: "Error al actualizar el carrito" });
    }
  }

  //Actualiza la cantidad de un producto de un carrito
  async updateQuantity(req, res) {
    try {
      const cartId = req.params.cid;
      const productId = req.params.pid;
      const quantity = req.body.quantity;
      const cart = await cartsModel.findById(cartId);
      if (!cart) {
        return res.status(404).send({ error: "Carrito no encontrado" });
      }
      const existingProduct = cart.products.find(
        (product) => product.product._id.toString() === productId
      );
      if (!existingProduct) {
        return res.status(404).send({ error: "Producto no encontrado" });
      }
      if (quantity < 1) {
        return res
          .status(400)
          .send({ error: "La cantidad debe ser mayor a 0" });
      }
      const updatedCart = await cartsModel.updateOne(
        { _id: cartId, "products.product": productId },
        { $set: { "products.$.quantity": quantity } }
      );
      return res.status(200).send(updatedCart);
    } catch (error) {
      return res
        .status(500)
        .send({ error: "Error al actualizar la cantidad del producto" });
    }
  }

  //   //Agrega un producto con la cantidad deseada al carrito existente
  async addProductAndQuantity(req, res) {
    try {
      const cartId = req.params.cid;
      const productId = req.params.pid;
      const quantity = req.body.quantity || req.params.quantity;
      const cart = await cartsModel.findById(cartId);
      if (!cart) {
        return res.status(404).send({ error: "Carrito no encontrado" });
      }
      const product = await productsModel.findById({ _id: productId });
      if (!product) {
        return res.status(404).send({ error: "Producto no encontrado" });
      }
      const existingProduct = cart.products.find(
        (product) => product.product._id.toString() === productId
      );
      if (existingProduct) {
        const updatedCart = await cartsModel.updateOne(
          { _id: cartId, "products.product": productId },
          {
            $set: {
              "products.$.quantity": existingProduct.quantity + quantity,
            },
          }, // Si el producto ya se encuentra en el carrito, se le suma la cantidad de los que se agregan
          { new: true }
        );
        return res.status(200).send(updatedCart);
      }
      if (quantity < 1) {
        return res
          .status(400)
          .send({ error: "La cantidad debe ser mayor a 0" });
      }
      const updatedCart = await cartsModel.updateOne(
        { _id: cartId },
        { $push: { products: { product: productId, quantity: quantity } } },
        { new: true }
      );
      return res.status(200).send(updatedCart);
    } catch (error) {
      return res
        .status(500)
        .send({ error: "Error al agregar el producto al carrito" });
    }
  }
}
export default CartManagerDB;
