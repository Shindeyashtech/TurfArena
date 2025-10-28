// backend/routes/turfs.js
const express = require('express');
const router = express.Router();
const Turf = require('../models/Turf');
const { protect } = require('../middleware/auth');

// Example: Get all turfs
router.get('/', async (req, res) => {
  try {
    const turfs = await Turf.find();
    res.json(turfs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch turfs' });
  }
});

// Create a new turf
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, location, pricing, amenities, specifications, availability, images } = req.body;

    // Validate required fields
    if (!name || !location?.address || !location?.city || !location?.state || !pricing?.basePrice) {
      return res.status(400).json({ error: 'Missing required fields: name, location (address, city, state), pricing.basePrice' });
    }

    const turf = new Turf({
      name,
      owner: req.user._id,
      description: description || '',
      images: images || [],
      location: {
        address: location.address,
        city: location.city,
        state: location.state,
        pincode: location.pincode || '',
        coordinates: location.coordinates || { type: 'Point', coordinates: [0, 0] }
      },
      pricing: {
        basePrice: pricing.basePrice,
        weekendPrice: pricing.weekendPrice || null,
        peakHourPrice: pricing.peakHourPrice || null
      },
      amenities: amenities || [],
      specifications: {
        pitchType: specifications?.pitchType || 'turf',
        dimensions: specifications?.dimensions || '',
        capacity: specifications?.capacity || null,
        lightingAvailable: specifications?.lightingAvailable || false
      },
      availability: availability || []
    });

    await turf.save();
    res.status(201).json(turf);
  } catch (err) {
    console.error('Error creating turf:', err);
    res.status(500).json({ error: 'Failed to create turf' });
  }
});

module.exports = router;
