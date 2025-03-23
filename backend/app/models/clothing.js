const mongoose = require("mongoose");

const ClothingSchema = new mongoose.Schema({
  name: String,
  type: String,
  color: String,
  season: String,
  imageUrl: String,
  tags: [String],
  userId: String,
}, { collection: "photos" });  // Ensures Mongoose queries "photos" collection

module.exports = mongoose.model("Clothing", ClothingSchema);
