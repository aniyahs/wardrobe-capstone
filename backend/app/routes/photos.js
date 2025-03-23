const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Define the schema for storing photo URLs
const PhotoSchema = new mongoose.Schema({
    userId: String,
    photoUrl: String,
    uploadedAt: { type: Date, default: Date.now }
});

// Create a model based on the schema
const Photo = mongoose.model('Photo', PhotoSchema);

// POST route to save the photo URL
router.post('/', async (req, res) => {
    const { userId, photoUrl } = req.body;

    if (!userId || !photoUrl) {
        return res.status(400).json({ message: 'Missing userId or photoUrl' });
    }

    try {
        // Log the photo data
        console.log('Saving photo:', { userId, photoUrl });

        // Create a new photo document
        const newPhoto = new Photo({ userId, photoUrl });
        await newPhoto.save();

        console.log('Photo saved:', newPhoto); // Log the saved photo

        res.status(201).json({ message: 'Photo saved successfully!' });
    } catch (error) {
        console.error('Error saving photo:', error);
        res.status(500).json({ message: 'Failed to save photo', error: error.message });
    }
});

// GET route to fetch all photos
router.get("/", async (req, res) => {
    try {
        console.log("🔍 Fetching photos...");
        const photos = await Photo.find();  // Fetch all photos from the database
        res.json(photos);  // Send photos as response
    } catch (error) {
        console.error("❌ Error fetching photos:", error);
        res.status(500).json({ error: "Error fetching photos." });
    }
});



module.exports = router;
