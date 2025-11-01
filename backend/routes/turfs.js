// backend/routes/turfs.js
const express = require('express');
const router = express.Router();
const Turf = require('../models/Turf');
const { protect } = require('../middleware/auth');

// Get all turfs
router.get('/', async (req, res) => {
  try {
    const { city, minPrice, maxPrice, sort, limit, owner } = req.query;

    let query = {};

    // Filter by owner (for turf owners to see only their turfs)
    if (owner) {
      query.owner = owner;
    }

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

// Update turf
router.put('/:id', protect, async (req, res) => {
  try {
    const turf = await Turf.findById(req.params.id);
    if (!turf) {
      return res.status(404).json({ error: 'Turf not found' });
    }

    // Check if user owns this turf
    if (turf.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this turf' });
    }

    const { name, description, location, pricing, amenities, specifications, availability, images } = req.body;

    // Update fields
    if (name) turf.name = name;
    if (description !== undefined) turf.description = description;
    if (images) turf.images = images;
    if (location) {
      if (location.address) turf.location.address = location.address;
      if (location.city) turf.location.city = location.city;
      if (location.state) turf.location.state = location.state;
      if (location.pincode) turf.location.pincode = location.pincode;
      if (location.coordinates) turf.location.coordinates = location.coordinates;
    }
    if (pricing) {
      if (pricing.basePrice) turf.pricing.basePrice = pricing.basePrice;
      if (pricing.weekendPrice !== undefined) turf.pricing.weekendPrice = pricing.weekendPrice;
      if (pricing.peakHourPrice !== undefined) turf.pricing.peakHourPrice = pricing.peakHourPrice;
    }
    if (amenities) turf.amenities = amenities;
    if (specifications) {
      if (specifications.pitchType) turf.specifications.pitchType = specifications.pitchType;
      if (specifications.dimensions) turf.specifications.dimensions = specifications.dimensions;
      if (specifications.capacity !== undefined) turf.specifications.capacity = specifications.capacity;
      if (specifications.lightingAvailable !== undefined) turf.specifications.lightingAvailable = specifications.lightingAvailable;
    }
    if (availability) turf.availability = availability;
    if (req.body.maintenanceDates) turf.maintenanceDates = req.body.maintenanceDates;

    await turf.save();
    res.json(turf);
  } catch (err) {
    console.error('Error updating turf:', err);
    res.status(500).json({ error: 'Failed to update turf' });
  }
});

// Update slot availability (for offline bookings)
router.put('/:id/slots', protect, async (req, res) => {
  try {
    const turf = await Turf.findById(req.params.id);
    if (!turf) {
      return res.status(404).json({ error: 'Turf not found' });
    }

    // Check if user owns this turf
    if (turf.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this turf' });
    }

    const { date, startTime, endTime, isBooked } = req.body;

    // Find the availability entry for the date
    const availabilityIndex = turf.availability.findIndex(
      avail => avail.date.toISOString().split('T')[0] === date
    );

    if (availabilityIndex === -1) {
      return res.status(404).json({ error: 'No availability found for this date' });
    }

    // Find the slot
    const slotIndex = turf.availability[availabilityIndex].slots.findIndex(
      slot => slot.startTime === startTime && slot.endTime === endTime
    );

    if (slotIndex === -1) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    // Update the slot booking status
    turf.availability[availabilityIndex].slots[slotIndex].isBooked = isBooked;

    await turf.save();
    res.json(turf);
  } catch (err) {
    console.error('Error updating slot:', err);
    res.status(500).json({ error: 'Failed to update slot' });
  }
});

// Delete turf
router.delete('/:id', protect, async (req, res) => {
  try {
    const turf = await Turf.findById(req.params.id);
    if (!turf) {
      return res.status(404).json({ error: 'Turf not found' });
    }

    // Check if user owns this turf
    if (turf.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this turf' });
    }

    await Turf.findByIdAndDelete(req.params.id);
    res.json({ message: 'Turf deleted successfully' });
  } catch (err) {
    console.error('Error deleting turf:', err);
    res.status(500).json({ error: 'Failed to delete turf' });
  }
});

module.exports = router;
