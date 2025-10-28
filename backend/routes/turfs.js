// backend/routes/turfs.js
const express = require('express');
const router = express.Router();
const Turf = require('../models/Turf');
const { protect } = require('../middleware/auth');

// Get all turfs
router.get('/', async (req, res) => {
  try {
    const { city, minPrice, maxPrice, sort, limit } = req.query;

    let query = {};

    // Filter by city
    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query['pricing.basePrice'] = {};
      if (minPrice) query['pricing.basePrice'].$gte = parseFloat(minPrice);
      if (maxPrice) query['pricing.basePrice'].$lte = parseFloat(maxPrice);
    }

    let sortOption = {};
    switch (sort) {
      case 'price_low':
        sortOption = { 'pricing.basePrice': 1 };
        break;
      case 'price_high':
        sortOption = { 'pricing.basePrice': -1 };
        break;
      case 'rating':
      default:
        sortOption = { 'ratings.average': -1 };
        break;
    }

    const turfs = await Turf.find(query)
      .sort(sortOption)
      .limit(limit ? parseInt(limit) : 0);

    res.json(turfs);
  } catch (err) {
    console.error('Error fetching turfs:', err);
    res.status(500).json({ error: 'Failed to fetch turfs' });
  }
});

// Get single turf by ID
router.get('/:id', async (req, res) => {
  try {
    const turf = await Turf.findById(req.params.id);
    if (!turf) {
      return res.status(404).json({ error: 'Turf not found' });
    }
    res.json(turf);
  } catch (err) {
    console.error('Error fetching turf:', err);
    res.status(500).json({ error: 'Failed to fetch turf' });
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
      availability: availability || [],
      maintenanceDates: req.body.maintenanceDates || []
    });

    await turf.save();
    res.status(201).json(turf);
  } catch (err) {
    console.error('Error creating turf:', err);
    res.status(500).json({ error: 'Failed to create turf' });
  }
});

module.exports = router;
