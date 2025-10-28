// Frontend: Updated TurfDetails.js with Mock Payment
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, Calendar, Clock } from 'lucide-react';
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

  useEffect(() => {
    fetchTurfDetails();
  }, [id]);

  const fetchTurfDetails = async () => {
    try {
      const res = await getTurf(id);
      setTurf(res.data.turf);
    } catch (error) {
      console.error('Error fetching turf:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelection = (slot) => {
    if (slot.isBooked) return;
    
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

      // Create booking
      await createBooking({
        ...currentBookingData,
        paymentId: currentOrder.paymentId
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
    a => a.date === selectedDate
  )?.slots || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ... rest of the TurfDetails component remains the same ... */}
      
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
