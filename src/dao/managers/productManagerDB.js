import productsModel from "../models/productsModel.js";

class ProductManagerDB {
  constructor() {
    this.productsModel = productsModel;
  }

  getProducts = async (
    limit = 10,
    page = 1,
    sort,
    category,
    available,
    baseUrl
  ) => {
    try {
      let query = this.productsModel.find();
      if (category) {
        const trimmedCategory = category.trim();
        const categoryRegex = new RegExp(`^${trimmedCategory}$`, "i");
        query = query.where("category").equals(categoryRegex);
      }
      if (available) {
        const lowerAvailable = available.toLowerCase();
        if (lowerAvailable === "true") {
          query = query.where("stock").gt(0);
        } else if (lowerAvailable === "false") {
          query = query.where("stock").equals(0);
        } else {
          throw new Error(
            "Valor de available inválido. Se espera true o false"
          );
        }
      }
      if (sort) {
        const lowerSort = sort.toLowerCase();
        if (lowerSort === "asc") {
          query = query.sort({ price: 1 });
        } else if (lowerSort === "desc") {
          query = query.sort({ price: -1 });
        } else {
          throw new Error("Valor de sort inválido. Se espera asc or desc");
        }
      }

      const products = await this.productsModel.paginate(query, {
        limit: parseInt(limit) || 10,
        lean: true,
        page: parseInt(page) || 1,
        customLabels: {
          docs: "products",
          totalDocs: "totalProducts",
        },
      });

      let navLinks = {};

      if (baseUrl) {
        const sortOptions = ["asc", "desc"];
        const availableOptions = ["true", "false"];
        const sortQuery =
          sort && sortOptions.includes(sort.toLowerCase())
            ? `&sort=${sort}`
            : "";
        const categoryQuery = category
          ? `&category=${encodeURIComponent(category)}`
          : "";
        const availableQuery =
          available && availableOptions.includes(available.toLowerCase())
            ? `&available=${available}`
            : "";
        navLinks = {
          firstLink:
            products.totalPages > 1
              ? `${baseUrl}?limit=${limit}&page=1${sortQuery}${categoryQuery}${availableQuery}`
              : null,
          prevLink: products.hasPrevPage
            ? `${baseUrl}?limit=${limit}&page=${products.prevPage}${sortQuery}${categoryQuery}${availableQuery}`
            : null,
          nextLink: products.hasNextPage
            ? `${baseUrl}?limit=${limit}&page=${products.nextPage}${sortQuery}${categoryQuery}${availableQuery}`
            : null,
          lastLink:
            products.totalPages > 1
              ? `${baseUrl}?limit=${limit}&page=${products.totalPages}${sortQuery}${categoryQuery}${availableQuery}`
              : null,
        };
      }
      const productsWithLinks = { ...products, ...navLinks };
      return productsWithLinks;
    } catch (error) {
      throw new Error(`Error al obtener los datos: ${error.message}`);
    }
  };

  async getProductById(req, res) {
    try {
      const productId = req.params.pid;
      const product = await productsModel.findOne({ _id: productId });

      if (product) {
        res.status(200).send({ product });
      } else {
        res.status(404).send({ error: "Producto no encontrado" });
      }
    } catch (error) {
      throw new Error("Error al obtener el producto");
    }
  }

  async addProduct(req, res) {
    try {
      const {
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
        thumbnails,
      } = req.body;

      if (
        !title ||
        !description ||
        !code ||
        !price ||
        !status ||
        !stock ||
        !category
      ) {
        return res
          .status(400)
          .send({ error: "Todos los campos son obligatorios" });
      }
      const codeRepeat = await productsModel.findOne({ code: code });
      if (codeRepeat) {
        return res
          .status(400)
          .send({ error: "El código del producto ya existe" });
      } else {
        const newProduct = await productsModel.create({
          title: title,
          description: description,
          code: code,
          price: price,
          status: status,
          stock: stock,
          category: category,
          thumbnails: thumbnails,
        });
        res.status(200).send({ message: "Producto agregado exitosamente" });
      }
    } catch (error) {
      throw new Error("Error al agregar el producto");
    }
  }

  async updateProduct(req, res) {
    try {
      const productId = req.params.pid;
      const {
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
        thumbnails,
      } = req.body;

      if (
        !title ||
        !description ||
        !code ||
        !price ||
        !status ||
        !stock ||
        !category
      ) {
        return res
          .status(400)
          .send({ error: "Todos los campos son obligatorios" });
      }
      const product = await productsModel.findOne({ _id: productId });

      if (product === null) {
        res.status(404).send({ error: "Producto no encontrado" });
      } else {
        const updatedProduct = await productsModel.updateOne(
          { _id: productId },
          {
            title: title,
            description: description,
            code: code,
            price: price,
            status: status,
            stock: stock,
            category: category,
            thumbnails: thumbnails,
          }
        );
        res.status(200).send({ message: "Producto modificado exitosamente" });
      }
    } catch (error) {
      throw new Error("Error al modificar el producto");
    }
  }

  async deleteProduct(req, res) {
    try {
      const productId = req.params.pid;
      const product = await productsModel.findOne({ _id: productId });

      if (product === null) {
        res.status(404).send({ error: "Producto no encontrado" });
      } else {
        const deletedProduct = await productsModel.deleteOne({
          _id: productId,
        });
        res.status(200).send({ message: "Producto eliminado exitosamente" });
      }
    } catch (error) {
      throw new Error("Error al eliminar el producto");
    }
  }

  async uploadProducts(req, res) {
    try {
      const result = await productsModel.insertMany([
        {
          title: "producto 1",
          description: "descripcion de producto 1",
          code: "abcx123",
          price: 200,
          status: true,
          stock: 25,
          category: "categoria producto 1",
          thumbnails: [
            "https://thumbs.dreamstime.com/z/best-product-year-spanish-award-ribbon-el-mejor-producto-del-ano-french-business-83173527.jpg?w=992",
          ],
        },
        {
          title: "producto 2",
          description: "descripcion de producto 2",
          code: "defx456",
          price: 150,
          status: true,
          stock: 10,
          category: "categoria producto 2",
          thumbnails: [
            "https://thumbs.dreamstime.com/z/best-product-year-spanish-award-ribbon-el-mejor-producto-del-ano-french-business-83173527.jpg?w=992",
          ],
        },
        {
          title: "producto 3",
          description: "descripcion de producto 3",
          code: "ghix789",
          price: 300,
          status: true,
          stock: 50,
          category: "categoria producto 3",
          thumbnails: [
            "https://thumbs.dreamstime.com/z/best-product-year-spanish-award-ribbon-el-mejor-producto-del-ano-french-business-83173527.jpg?w=992",
          ],
        },
        {
          title: "producto 4",
          description: "descripcion de producto 4",
          code: "jklx012",
          price: 180,
          status: true,
          stock: 15,
          category: "categoria producto 4",
          thumbnails: [
            "https://thumbs.dreamstime.com/z/best-product-year-spanish-award-ribbon-el-mejor-producto-del-ano-french-business-83173527.jpg?w=992",
          ],
        },
        {
          title: "producto 5",
          description: "descripcion de producto 5",
          code: "mnox345",
          price: 250,
          status: true,
          stock: 5,
          category: "categoria producto 5",
          thumbnails: [
            "https://thumbs.dreamstime.com/z/best-product-year-spanish-award-ribbon-el-mejor-producto-del-ano-french-business-83173527.jpg?w=992",
          ],
        },
        {
          title: "producto 6",
          description: "descripcion de producto 6",
          code: "pqr6x78",
          price: 350,
          status: true,
          stock: 30,
          category: "categoria producto 6",
          thumbnails: [
            "https://thumbs.dreamstime.com/z/best-product-year-spanish-award-ribbon-el-mejor-producto-del-ano-french-business-83173527.jpg?w=992",
          ],
        },
        {
          title: "producto 7",
          description: "descripcion de producto 7",
          code: "stux901",
          price: 190,
          status: true,
          stock: 20,
          category: "categoria producto 7",
          thumbnails: [
            "https://thumbs.dreamstime.com/z/best-product-year-spanish-award-ribbon-el-mejor-producto-del-ano-french-business-83173527.jpg?w=992",
          ],
        },
        {
          title: "producto 8",
          description: "descripcion de producto 8",
          code: "vwxx234",
          price: 280,
          status: true,
          stock: 8,
          category: "categoria producto 8",
          thumbnails: [
            "https://thumbs.dreamstime.com/z/best-product-year-spanish-award-ribbon-el-mejor-producto-del-ano-french-business-83173527.jpg?w=992",
          ],
        },
        {
          title: "producto 9",
          description: "descripcion de producto 9",
          code: "yzax567",
          price: 220,
          status: true,
          stock: 18,
          category: "categoria producto 9",
          thumbnails: [
            "https://thumbs.dreamstime.com/z/best-product-year-spanish-award-ribbon-el-mejor-producto-del-ano-french-business-83173527.jpg?w=992",
          ],
        },
        {
          title: "producto 10",
          description: "descripcion de producto 10",
          code: "bcdx890",
          price: 170,
          status: true,
          stock: 12,
          category: "categoria producto 10",
          thumbnails: [
            "https://thumbs.dreamstime.com/z/best-product-year-spanish-award-ribbon-el-mejor-producto-del-ano-french-business-83173527.jpg?w=992",
          ],
        },
        {
          title: "producto 11",
          description: "descripcion de producto 11",
          code: "abcx111",
          price: 600,
          status: true,
          stock: 19,
          category: "categoria producto 11",
          thumbnails: [
            "https://thumbs.dreamstime.com/z/best-product-year-spanish-award-ribbon-el-mejor-producto-del-ano-french-business-83173527.jpg?w=992",
          ],
        },
        {
          title: "producto 12",
          description: "descripcion de producto 12",
          code: "abcx222",
          price: 200,
          status: true,
          stock: 12,
          category: "categoria producto 12",
          thumbnails: [
            "https://thumbs.dreamstime.com/z/best-product-year-spanish-award-ribbon-el-mejor-producto-del-ano-french-business-83173527.jpg?w=992",
          ],
        },
        {
          title: "producto 13",
          description: "descripcion de producto 13",
          code: "abcx333",
          price: 233,
          status: true,
          stock: 13,
          category: "categoria producto 13",
          thumbnails: [
            "https://thumbs.dreamstime.com/z/best-product-year-spanish-award-ribbon-el-mejor-producto-del-ano-french-business-83173527.jpg?w=992",
          ],
        },
        {
          title: "producto 14",
          description: "descripcion de producto 14",
          code: "sdfxs14",
          price: 144,
          status: true,
          stock: 14,
          category: "categoria producto 14",
          thumbnails: [
            "https://thumbs.dreamstime.com/z/best-product-year-spanish-award-ribbon-el-mejor-producto-del-ano-french-business-83173527.jpg?w=992",
          ],
        },
        {
          title: "producto 15",
          description: "descripcion de producto 15",
          code: "sdfxs15",
          price: 155,
          status: true,
          stock: 15,
          category: "categoria producto 15",
          thumbnails: [
            "https://thumbs.dreamstime.com/z/best-product-year-spanish-award-ribbon-el-mejor-producto-del-ano-french-business-83173527.jpg?w=992",
          ],
        },
      ]);
      res.status(200).send({ message: "Productos agregados exitosamente" });
    } catch (error) {
      throw new Error("Error al agregar los productos");
    }
  }
}

export default ProductManagerDB;
