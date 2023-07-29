import mongoose from "mongoose";

const usersCollection = "users";

const usersSchema = new mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  dateOfBirth: {
    type: Date,
  },
  password: {
    type: String,
  },
});

const usersModel = mongoose.model(usersCollection, usersSchema);

export default usersModel;
