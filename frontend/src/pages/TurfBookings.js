import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Clock, User, Phone, Mail, CheckCircle, XCircle } from 'lucide-react';
import { getTurfBookings, confirmPayment } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const TurfBookings = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, completed, cancelled

  useEffect(() => {
    fetchBookings();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBookings = async () => {
    try {
      const res = await getTurfBookings(id);
      setBookings(res.data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (bookingId) => {
    if (!window.confirm('Are you sure you want to confirm this payment?')) {
      return;
    }

    try {
      await confirmPayment(bookingId);
      // Refresh bookings list
      fetchBookings();
      alert('Payment confirmed successfully!');
    } catch (error) {
      console.error('Error confirming payment:', error);
      alert('Failed to confirm payment. Please try again.');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Turf Bookings</h1>

        {/* Filter Buttons */}
        <div className="flex space-x-2 mb-6">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg capitalize transition ${
                filter === status
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
          <p className="text-gray-500">
            {filter === 'all' ? 'No bookings have been made for this turf yet.' : `No ${filter} bookings found.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredBookings.map(booking => (
            <div key={booking._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Booking #{booking._id.slice(-8)}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar size={16} />
                      <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock size={16} />
                      <span>
                        {booking.slots.map(slot => `${slot.startTime}-${slot.endTime}`).join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                  <div className="text-lg font-bold text-green-500 mt-2">
                    ₹{booking.totalAmount}
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Customer Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <User size={16} className="text-gray-500" />
                    <span>{booking.customerDetails?.name || booking.user.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail size={16} className="text-gray-500" />
                    <span>{booking.customerDetails?.email || booking.user.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone size={16} className="text-gray-500" />
                    <span>{booking.customerDetails?.phone || booking.user.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold mb-3">Booking Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Created:</span> {new Date(booking.createdAt).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Slots:</span> {booking.slots.length} hour{booking.slots.length > 1 ? 's' : ''}
                  </div>
                </div>

                {/* Action Buttons for Turf Owners */}
                {user?.role === 'turf_owner' && booking.status === 'pending' && (
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => handleConfirmPayment(booking._id)}
                      className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    >
                      <CheckCircle size={16} className="mr-2" />
                      Confirm Payment
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TurfBookings;
