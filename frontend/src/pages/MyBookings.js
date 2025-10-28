import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, DollarSign, AlertCircle, CheckCircle, XCircle, Download } from 'lucide-react';
import { getMyBookings, cancelBooking } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, completed, cancelled

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await getMyBookings();
      setBookings(res.data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await cancelBooking(bookingId);
      // Refresh bookings after cancellation
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <AlertCircle className="text-yellow-500" size={20} />;
      case 'confirmed': return <CheckCircle className="text-green-500" size={20} />;
      case 'completed': return <CheckCircle className="text-blue-500" size={20} />;
      case 'cancelled': return <XCircle className="text-red-500" size={20} />;
      default: return <AlertCircle className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const canCancelBooking = (booking) => {
    if (booking.status !== 'pending' && booking.status !== 'confirmed') return false;

    const bookingTime = new Date(booking.bookingDate);
    const now = new Date();
    const hoursDifference = (bookingTime - now) / (1000 * 60 * 60);

    return hoursDifference >= 24; // Can cancel if more than 24 hours before
  };

  const downloadReceipt = async (booking) => {
    const receiptElement = document.createElement('div');
    receiptElement.style.width = '600px';
    receiptElement.style.padding = '20px';
    receiptElement.style.fontFamily = 'Arial, sans-serif';
    receiptElement.style.backgroundColor = '#ffffff';
    receiptElement.style.color = '#000000';
    receiptElement.innerHTML = `
      <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px;">
        <h1 style="margin: 0; color: #2563eb;">TurfArena</h1>
        <p style="margin: 5px 0; font-size: 14px;">Booking Receipt</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h2 style="margin: 0 0 10px 0; color: #1f2937;">Booking Details</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
          <div><strong>Booking ID:</strong> #${booking._id.slice(-8)}</div>
          <div><strong>Status:</strong> ${booking.status}</div>
          <div><strong>Booked on:</strong> ${new Date(booking.createdAt).toLocaleDateString()}</div>
          <div><strong>Duration:</strong> ${booking.slots.length} hour${booking.slots.length > 1 ? 's' : ''}</div>
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; color: #1f2937;">Turf Information</h3>
        <div style="font-size: 14px;">
          <div><strong>Turf Name:</strong> ${booking.turf.name}</div>
          <div><strong>Location:</strong> ${booking.turf.location.city}</div>
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; color: #1f2937;">Booking Schedule</h3>
        <div style="font-size: 14px;">
          <div><strong>Date:</strong> ${new Date(booking.bookingDate).toLocaleDateString()}</div>
          <div><strong>Time Slots:</strong> ${booking.slots.map(slot => `${slot.startTime}-${slot.endTime}`).join(', ')}</div>
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; color: #1f2937;">Customer Details</h3>
        <div style="font-size: 14px;">
          <div><strong>Name:</strong> ${booking.customerDetails?.name || booking.user.name}</div>
          <div><strong>Email:</strong> ${booking.customerDetails?.email || booking.user.email}</div>
          <div><strong>Phone:</strong> ${booking.customerDetails?.phone || booking.user.phone || 'N/A'}</div>
        </div>
      </div>
      
      <div style="border-top: 1px solid #ccc; padding-top: 15px; text-align: right;">
        <div style="font-size: 18px; font-weight: bold; color: #059669;">
          Total Amount: ₹${booking.totalAmount}
        </div>
      </div>
      
      <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
        <p>Thank you for choosing TurfArena!</p>
        <p>This is a computer-generated receipt and does not require a signature.</p>
      </div>
    `;

    document.body.appendChild(receiptElement);

    try {
      const canvas = await html2canvas(receiptElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`booking-receipt-${booking._id.slice(-8)}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to download receipt. Please try again.');
    } finally {
      document.body.removeChild(receiptElement);
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">My Bookings</h1>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
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
            {filter === 'all' ? 'You haven\'t made any bookings yet.' : `No ${filter} bookings found.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredBookings.map(booking => (
            <div key={booking._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start space-x-4">
                  {getStatusIcon(booking.status)}
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {booking.turf.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
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
                      <div className="flex items-center space-x-1">
                        <MapPin size={16} />
                        <span>{booking.turf.location.city}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        Booked on {new Date(booking.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-500 mb-2">
                    ₹{booking.totalAmount}
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <span className="font-medium">Booking ID:</span> #{booking._id.slice(-8)}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> {booking.slots.length} hour{booking.slots.length > 1 ? 's' : ''}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> {booking.status}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => downloadReceipt(booking)}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                  >
                    <Download size={16} className="mr-2" />
                    Download Receipt
                  </button>
                  {canCancelBooking(booking) && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
