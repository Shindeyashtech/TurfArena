// Frontend: Updated TurfDetails.js with Mock Payment
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, Clock } from 'lucide-react';
import { getTurf, createBooking, createPaymentOrder, verifyPayment } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import MockPaymentModal from '../components/MockPaymentModal';

const TurfDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [turf, setTurf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [currentBookingData, setCurrentBookingData] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  const fetchTurfDetails = useCallback(async () => {
    try {
      const res = await getTurf(id);
      console.log('Turf details response:', res.data);
      setTurf(res.data);
    } catch (error) {
      console.error('Error fetching turf:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTurfDetails();
  }, [fetchTurfDetails]);

  useEffect(() => {
    if (turf && user) {
      setIsOwner(turf.owner === user._id);
    }
  }, [turf, user]);

  const handleSlotSelection = (slot) => {
    const isMaintenance = turf.maintenanceDates?.includes(selectedDate);
    if (slot.isBooked || isMaintenance) return;

    const slotKey = `${slot.startTime}-${slot.endTime}`;
    if (selectedSlots.includes(slotKey)) {
      setSelectedSlots(selectedSlots.filter(s => s !== slotKey));
    } else {
      setSelectedSlots([...selectedSlots, slotKey]);
    }
  };

  const calculateTotalAmount = () => {
    return selectedSlots.length * turf.pricing.basePrice;
  };

  const handleBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (selectedSlots.length === 0) {
      alert('Please select at least one slot');
      return;
    }

    try {
      setBookingLoading(true);

      // Parse slots
      const slots = selectedSlots.map(slotKey => {
        const [startTime, endTime] = slotKey.split('-');
        return { startTime, endTime };
      });

      const totalAmount = calculateTotalAmount();

      // Store booking data for later
      setCurrentBookingData({
        turf: id,
        bookingDate: selectedDate,
        slots,
        totalAmount
      });

      // Create Mock payment order
      const orderRes = await createPaymentOrder({
        amount: totalAmount,
        paymentType: 'booking'
      });

      const { order, paymentId } = orderRes.data;
      setCurrentOrder({ ...order, paymentId });
      
      // Show mock payment modal
      setShowPaymentModal(true);
      
    } catch (error) {
      console.error('Booking error:', error);
      alert('Booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      // Verify payment
      await verifyPayment({
        razorpayOrderId: paymentData.razorpayOrderId,
        razorpayPaymentId: paymentData.razorpayPaymentId,
        razorpaySignature: paymentData.razorpaySignature,
        paymentId: currentOrder.paymentId
      });

      // Create booking with customer details
      await createBooking({
        ...currentBookingData,
        paymentId: currentOrder.paymentId,
        customerDetails: paymentData.customerDetails
      });

      setShowPaymentModal(false);
      alert('Booking successful!');
      navigate('/bookings');
    } catch (error) {
      console.error('Payment verification failed:', error);
      alert('Payment verification failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!turf) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Turf not found</p>
      </div>
    );
  }

  const availableSlots = turf.availability.find(
    a => new Date(a.date).toISOString().split('T')[0] === selectedDate
  )?.slots || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Turf Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="h-64 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">🏟️</div>
            <h1 className="text-3xl font-bold">{turf.name}</h1>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <MapPin size={20} className="text-gray-500" />
              <span className="text-lg">{turf.location.address}, {turf.location.city}, {turf.location.state}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="text-yellow-500 fill-current" size={20} />
              <span className="text-xl font-bold">{turf.ratings.average.toFixed(1)}</span>
              <span className="text-gray-500">({turf.ratings.count} reviews)</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">{turf.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>📏 {turf.specifications.pitchType}</span>
                <span>👥 Capacity: {turf.specifications.capacity || 'N/A'}</span>
                {turf.specifications.lightingAvailable && <span>💡 Lighting Available</span>}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-500">₹{turf.pricing.basePrice}</div>
              <div className="text-sm text-gray-500">per hour</div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Date Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">Select Date</h3>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 mb-4"
              min={new Date().toISOString().split('T')[0]}
            />
            {isOwner && (
              <div className="mt-4">
              </div>
            )}
          </div>
        </div>

        {/* Slots */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">Available Slots</h3>
            {selectedDate ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {availableSlots.map((slot, index) => {
                  const isMaintenance = turf.maintenanceDates?.includes(selectedDate);
                  const isBooked = slot.isBooked || isMaintenance;
                  return (
                    <button
                      key={index}
                      onClick={() => handleSlotSelection(slot)}
                      disabled={isBooked}
                      className={`p-4 rounded-lg border-2 transition ${
                        selectedSlots.includes(`${slot.startTime}-${slot.endTime}`)
                          ? 'border-green-500 bg-green-50 dark:bg-green-900'
                          : isBooked
                          ? isMaintenance
                          ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900 cursor-not-allowed'
                          : 'border-red-300 bg-red-50 dark:bg-red-900 cursor-not-allowed'
                          : 'border-gray-300 hover:border-green-500'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Clock size={16} />
                        <span>{slot.startTime} - {slot.endTime}</span>
                      </div>
                      {isBooked && (
                        <span className={`text-sm ${isMaintenance ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-500'}`}>
                          {isMaintenance ? 'Maintenance' : 'Booked'}
                        </span>
                      )}
                    </button>
                  );
                })}
                {availableSlots.length > 0 && availableSlots.every(slot => slot.isBooked) && !turf.maintenanceDates?.includes(selectedDate) && (
                  <div className="col-span-full text-center py-8">
                    <div className="text-yellow-500 text-lg font-semibold mb-2">This date is fully booked</div>
                    <div className="text-gray-500">Please select a different date</div>
                  </div>
                )}
                {turf.maintenanceDates?.includes(selectedDate) && (
                  <div className="col-span-full text-center py-8">
                    <div className="text-yellow-500 text-lg font-semibold mb-2">This date is under maintenance</div>
                    <div className="text-gray-500">Please select a different date</div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Please select a date to view available slots</p>
            )}
          </div>
        </div>
      </div>

      {/* Booking Summary */}
      {selectedSlots.length > 0 && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Booking Summary</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg">Selected Slots: {selectedSlots.length}</p>
              <p className="text-gray-600">Total Amount: ₹{calculateTotalAmount()}</p>
            </div>
            <button
              onClick={handleBooking}
              disabled={bookingLoading}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {bookingLoading ? 'Processing...' : 'Book Now'}
            </button>
          </div>
        </div>
      )}

      {/* Turf Owner Booking Details */}
      {isOwner && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Booking Details</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            As the turf owner, you can view all bookings for this turf. Click the button below to see booking details.
          </p>
          <button
            onClick={() => navigate(`/turf-bookings/${id}`)}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            View All Bookings
          </button>
        </div>
      )}

      {/* Mock Payment Modal */}
      <MockPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={calculateTotalAmount()}
        orderId={currentOrder?.id}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default TurfDetails;
