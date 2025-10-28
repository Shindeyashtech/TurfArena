const mongoose = require('mongoose'); // ← This line is mandatory
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Turf = require('../models/Turf');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @route   POST /api/bookings
// @desc    Create booking
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { turf, bookingDate, slots, totalAmount, customerDetails } = req.body;

    // Check if slots are available
    const turfDoc = await Turf.findById(turf);
    if (!turfDoc) {
      return res.status(404).json({ message: 'Turf not found' });
    }

    // Check slot availability logic here
    const availability = turfDoc.availability.find(
      a => new Date(a.date).toDateString() === new Date(bookingDate).toDateString()
    );

    if (!availability) {
      return res.status(400).json({ message: 'No slots available for this date' });
    }

    // Verify all requested slots are available
    for (const requestedSlot of slots) {
      const turfSlot = availability.slots.find(
        s => s.startTime === requestedSlot.startTime &&
             s.endTime === requestedSlot.endTime
      );

      if (!turfSlot || turfSlot.isBooked) {
        return res.status(400).json({
          message: `Slot ${requestedSlot.startTime}-${requestedSlot.endTime} is not available`
        });
      }
    }

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      turf,
      bookingDate,
      slots,
      totalAmount,
      status: 'pending',
      customerDetails
    });

    // Mark slots as booked (will be confirmed after payment)
    slots.forEach(requestedSlot => {
      const turfSlot = availability.slots.find(
        s => s.startTime === requestedSlot.startTime &&
             s.endTime === requestedSlot.endTime
      );
      if (turfSlot) {
        turfSlot.isBooked = true;
        turfSlot.bookingId = booking._id;
      }
    });    await turfDoc.save();

    // Send notification to turf owner
    if (turfDoc.owner) {
      await Notification.create({
        user: turfDoc.owner,
        type: 'new_booking',
        title: 'New Booking Received',
        message: `You have received a new booking for ${turfDoc.name} on ${new Date(bookingDate).toLocaleDateString()}`,
        actionUrl: `/turf-bookings/${turf}`,
        data: {
          bookingId: booking._id,
          turfId: turf,
          customerName: customerDetails?.name || 'Customer',
          bookingDate: bookingDate,
          totalAmount: totalAmount
        }
      });

      // Emit real-time socket event to turf owner
      const io = req.app.get('io');
      if (io) {
        io.to(turfDoc.owner.toString()).emit('new-booking', {
          _id: booking._id,
          turf: turf,
          bookingDate: bookingDate,
          slots: slots,
          totalAmount: totalAmount,
          customerDetails: customerDetails,
          status: 'pending',
          createdAt: booking.createdAt
        });
      }
    }

    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/bookings/my
// @desc    Get user bookings
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('turf', 'name location images pricing')
      .sort('-createdAt');

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get booking by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('turf', 'name location images pricing')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    const turf = await Turf.findById(booking.turf._id);
    if (
      booking.user._id.toString() !== req.user._id.toString() &&
      turf.owner.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/bookings/:id/confirm
// @desc    Confirm booking after payment
// @access  Private
router.put('/:id/confirm', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = 'confirmed';
    await booking.save();

    // Send confirmation notification
    await Notification.create({
      user: req.user._id,
      type: 'booking_confirmation',
      title: 'Booking Confirmed',
      message: `Your booking at ${booking.turf.name} has been confirmed`,
      actionUrl: `/bookings/${booking._id}`
    });

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel booking
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('turf');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization: either the user who made the booking OR the turf owner
    const isTurfOwner = booking.turf.owner && booking.turf.owner.toString() === req.user._id.toString();
    const isBookingUser = booking.user.toString() === req.user._id.toString();

    if (!isBookingUser && !isTurfOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot cancel this booking - already ' + booking.status });
    }

    // Only enforce 24-hour restriction for regular users, not turf owners
    if (!isTurfOwner && req.user.role !== 'admin') {
      const bookingTime = new Date(booking.bookingDate);
      const now = new Date();
      const hoursDifference = (bookingTime - now) / (1000 * 60 * 60);

      if (hoursDifference < 24) {
        return res.status(400).json({
          message: 'Cannot cancel booking less than 24 hours before booking time'
        });
      }
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancelledBy = req.user._id;
    await booking.save();

    // Free up the slots in turf
    const turf = await Turf.findById(booking.turf);
    const availability = turf.availability.find(
      a => new Date(a.date).toDateString() === new Date(booking.bookingDate).toDateString()
    );

    if (availability) {
      booking.slots.forEach(slot => {
        const turfSlot = availability.slots.find(
          s => s.startTime === slot.startTime && s.endTime === slot.endTime
        );
        if (turfSlot) {
          turfSlot.isBooked = false;
          turfSlot.bookingId = null;
        }
      });
      await turf.save();
    }    // Send cancellation notification
    const cancelledByOwner = isTurfOwner || req.user.role === 'admin';
    
    // Notify the customer
    await Notification.create({
      user: booking.user,
      type: 'booking_confirmation',
      title: cancelledByOwner ? 'Booking Cancelled by Turf Owner' : 'Booking Cancelled',
      message: cancelledByOwner 
        ? `Your booking at ${booking.turf.name} has been cancelled by the turf owner`
        : `Your booking at ${booking.turf.name} has been cancelled`,
      actionUrl: `/bookings`
    });

    // If cancelled by turf owner, also log it
    if (cancelledByOwner && !isBookingUser) {
      await Notification.create({
        user: req.user._id,
        type: 'booking_confirmation',
        title: 'Booking Cancelled',
        message: `You cancelled a booking for ${booking.turf.name}`,
        actionUrl: `/turf-bookings/${booking.turf._id}`
      });
    }

    res.json({ 
      success: true, 
      booking,
      message: 'Booking cancelled successfully. Slots have been freed up.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/bookings/:id/confirm-payment
// @desc    Confirm payment received (Turf Owner)
// @access  Private (Turf Owner)
router.put('/:id/confirm-payment', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('turf');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is the turf owner
    if (booking.turf.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to confirm this payment' });
    }    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Booking is not in pending status' });
    }

    booking.status = 'confirmed';
    booking.confirmedAt = new Date();
    await booking.save();

    // Send confirmation notification to user
    await Notification.create({
      user: booking.user,
      type: 'booking_confirmation',
      title: 'Booking Confirmed',
      message: `Your booking at ${booking.turf.name} has been confirmed by the turf owner`,
      actionUrl: `/my-bookings`
    });

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/bookings/turf/:turfId
// @desc    Get bookings for a specific turf (Turf Owner)
// @access  Private (Turf Owner)
router.get('/turf/:turfId', protect, async (req, res) => {
  try {
    const turf = await Turf.findById(req.params.turfId);

    if (!turf) {
      return res.status(404).json({ message: 'Turf not found' });
    }

    if (turf.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const bookings = await Booking.find({ turf: req.params.turfId })
      .populate('user', 'name email phone')
      .sort('-bookingDate');

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
