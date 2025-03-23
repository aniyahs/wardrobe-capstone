const express = require("express"); 
const Clothing = require("../models/clothing");

const router = express.Router();

// Fetch all clothing items (without authentication)
router.get("/", async (req, res) => {
    try {
      console.log("🔍 Fetching from test.photos collection...");
      const clothingItems = await Clothing.find();
      res.json(clothingItems);
    } catch (error) {
      console.error("❌ Error fetching clothing items:", error);
      res.status(500).json({ error: "Error fetching clothing items." });
    }
  });

// Add a new clothing item (still requires authentication)
router.post("/", require("../middleware/authMiddleware"), async (req, res) => {
  try {
    const { name, type, color, season, imageUrl, tags } = req.body;
    const newClothing = new Clothing({
      name,
      type,
      color,
      season,
      imageUrl,
      tags,
      userId: req.user.id,
    });

    await newClothing.save();
    res.status(201).json(newClothing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error adding clothing item." });
  }
});

module.exports = router;
