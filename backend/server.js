require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const photosRouter = require('./app/routes/photos');  
const clothingRouter = require('./app/routes/clothingAPI');  // Add clothing route

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Use routes
app.use('/api/photos', photosRouter);
app.use('/api/clothing', clothingRouter);  // New route

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
