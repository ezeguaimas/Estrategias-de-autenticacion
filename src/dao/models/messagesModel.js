import mongoose from "mongoose";

const collection = "messages";

const schema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    match: /^\S+@\S+\.\S+$/
  },
  message: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

const messagesModel = mongoose.model(collection, schema);

export default messagesModel;
