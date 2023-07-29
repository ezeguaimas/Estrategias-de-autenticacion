import mongoose from "mongoose";

const collection = "carts";

const schema = new mongoose.Schema({
  products: {
    type: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },
      },
    ],
    default: [],
    required: true,
  },
});

// schema.pre("find", function () {
//   this.populate("products.product");
// });

// schema.pre("findById", function () {
//   this.populate("products.product");
// });

// schema.pre("findOne", function () {
//   this.populate("products.product");
// });


const cartsModel = mongoose.model(collection, schema);

export default cartsModel;
