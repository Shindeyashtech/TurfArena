import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Clock, User, Phone, Mail, CheckCircle, XCircle, Download, Undo, FileText } from 'lucide-react';
import { getTurfBookings, confirmPayment, cancelBooking, getTurf } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const TurfBookings = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const socket = useSocket();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, completed, cancelled
  const [showNewBookingPopup, setShowNewBookingPopup] = useState(false);
  const [newBooking, setNewBooking] = useState(null);
  const [turfDetails, setTurfDetails] = useState(null);

  useEffect(() => {
    if (id) {
      fetchBookings();
    }
  }, [id]); // Only refetch when turf ID changes

  // Real-time booking notifications for turf owners
  useEffect(() => {
    if (socket && user?.role === 'turf_owner') {
      socket.on('new-booking', (booking) => {
        if (booking.turf === id || booking.turf._id === id) {
          setNewBooking(booking);
          setShowNewBookingPopup(true);
          fetchBookings(); // Refresh the list
          
          // Auto-hide popup after 10 seconds
          setTimeout(() => {
            setShowNewBookingPopup(false);
          }, 10000);
        }
      });

      return () => {
        socket.off('new-booking');
      };
    }
  }, [socket, user, id]);
  const fetchBookings = async () => {
    try {
      const res = await getTurfBookings(id);
      setBookings(res.data.bookings);
      
      // Fetch turf details for PDF generation
      if (!turfDetails) {
        try {
          const turfRes = await getTurf(id);
          setTurfDetails(turfRes.data);
        } catch (error) {
          console.error('Error fetching turf details:', error);
        }
      }
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
  const handleCancelBooking = async (bookingId) => {
    const confirmMessage = user?.role === 'turf_owner' 
      ? 'Are you sure you want to cancel this booking? This will:\n• Free up the time slots\n• Notify the customer\n• Cannot be undone'
      : 'Are you sure you want to cancel this booking? This will free up the slots.';
      
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const res = await cancelBooking(bookingId);
      fetchBookings();
      
      // Show success message
      const successMsg = res.data?.message || 'Booking cancelled successfully! Slots are now available.';
      alert(successMsg);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      const errorMsg = error.response?.data?.message || 'Failed to cancel booking. Please try again.';
      alert(errorMsg);
    }
  };const downloadReceipt = async (booking) => {
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
          <div><strong>Turf Name:</strong> ${turfDetails?.name || 'N/A'}</div>
          <div><strong>Location:</strong> ${turfDetails?.location?.city || 'N/A'}</div>
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
          <div><strong>Name:</strong> ${booking.customerDetails?.name || booking.user?.name || 'N/A'}</div>
          <div><strong>Email:</strong> ${booking.customerDetails?.email || booking.user?.email || 'N/A'}</div>
          <div><strong>Phone:</strong> ${booking.customerDetails?.phone || booking.user?.phone || 'N/A'}</div>
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

      pdf.save(`TurfArena_Receipt_${booking._id.slice(-8)}.pdf`);
      alert('Receipt downloaded successfully!');
    } catch (error) {
      console.error('Error generating receipt:', error);
      alert('Failed to generate receipt. Please try again.');
    } finally {
      document.body.removeChild(receiptElement);
    }
  };

  const downloadMonthlySummary = async () => {
    const currentDate = new Date();
    const month = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();

    // Calculate totals
    const totalBookings = filteredBookings.length;
    const totalRevenue = filteredBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const confirmedBookings = filteredBookings.filter(b => b.status === 'confirmed').length;
    const pendingBookings = filteredBookings.filter(b => b.status === 'pending').length;
    const cancelledBookings = filteredBookings.filter(b => b.status === 'cancelled').length;

    const summaryElement = document.createElement('div');
    summaryElement.style.width = '800px';
    summaryElement.style.padding = '30px';
    summaryElement.style.fontFamily = 'Arial, sans-serif';
    summaryElement.style.backgroundColor = '#ffffff';
    summaryElement.style.color = '#000000';
    summaryElement.innerHTML = `
      <div style="text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="margin: 0; color: #2563eb; font-size: 32px;">TurfArena</h1>
        <h2 style="margin: 10px 0; color: #1f2937;">Monthly Booking Summary</h2>
        <p style="margin: 5px 0; font-size: 16px; color: #666;">${month} ${year}</p>
      </div>
      
      <div style="margin-bottom: 30px;">
        <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Summary Statistics</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
            <div style="font-size: 14px; color: #666;">Total Bookings</div>
            <div style="font-size: 28px; font-weight: bold; color: #2563eb;">${totalBookings}</div>
          </div>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
            <div style="font-size: 14px; color: #666;">Total Revenue</div>
            <div style="font-size: 28px; font-weight: bold; color: #059669;">₹${totalRevenue}</div>
          </div>
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px;">
            <div style="font-size: 14px; color: #666;">Pending</div>
            <div style="font-size: 24px; font-weight: bold; color: #d97706;">${pendingBookings}</div>
          </div>
          <div style="background: #d1fae5; padding: 15px; border-radius: 8px;">
            <div style="font-size: 14px; color: #666;">Confirmed</div>
            <div style="font-size: 24px; font-weight: bold; color: #059669;">${confirmedBookings}</div>
          </div>
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Booking Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #d1d5db;">ID</th>
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #d1d5db;">Customer</th>
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #d1d5db;">Date</th>
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #d1d5db;">Slots</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #d1d5db;">Amount</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #d1d5db;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredBookings.slice(0, 20).map((booking, index) => `
              <tr style="border-bottom: 1px solid #e5e7eb; ${index % 2 === 0 ? 'background: #f9fafb;' : ''}">
                <td style="padding: 8px;">#${booking._id.slice(-6)}</td>
                <td style="padding: 8px;">${booking.customerDetails?.name || booking.user?.name || 'N/A'}</td>
                <td style="padding: 8px;">${new Date(booking.bookingDate).toLocaleDateString()}</td>
                <td style="padding: 8px;">${booking.slots.length}h</td>
                <td style="padding: 8px; text-align: right; font-weight: bold;">₹${booking.totalAmount}</td>
                <td style="padding: 8px; text-align: center;">
                  <span style="padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;
                    ${booking.status === 'confirmed' ? 'background: #d1fae5; color: #059669;' : 
                      booking.status === 'pending' ? 'background: #fef3c7; color: #d97706;' : 
                      'background: #fee2e2; color: #dc2626;'}">
                    ${booking.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${filteredBookings.length > 20 ? `<p style="margin-top: 10px; font-size: 12px; color: #666; font-style: italic;">Showing first 20 of ${filteredBookings.length} bookings</p>` : ''}
      </div>
      
      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; font-size: 12px; color: #666;">
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <p>Owner: ${user?.name || 'Turf Owner'}</p>
        <p style="margin-top: 10px;">TurfArena - Your Sports Booking Partner</p>
      </div>
    `;

    document.body.appendChild(summaryElement);

    try {
      const canvas = await html2canvas(summaryElement, {
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

      pdf.save(`TurfArena_Monthly_Summary_${month}_${year}.pdf`);
      alert('Monthly summary downloaded successfully!');
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('Failed to generate summary. Please try again.');
    } finally {
      document.body.removeChild(summaryElement);
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
      {/* New Booking Popup for Turf Owners */}
      {showNewBookingPopup && newBooking && (
        <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-md border-l-4 border-green-500 animate-slide-in">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                <Calendar className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-600 dark:text-green-400">New Booking!</h3>
                <p className="text-sm text-gray-500">Just received</p>
              </div>
            </div>
            <button
              onClick={() => setShowNewBookingPopup(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle size={20} />
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Customer:</span>
              <span className="font-semibold">{newBooking.customerDetails?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Date:</span>
              <span className="font-semibold">{new Date(newBooking.bookingDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Time:</span>
              <span className="font-semibold">
                {newBooking.slots?.map(slot => `${slot.startTime}-${slot.endTime}`).join(', ')}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="text-gray-600 dark:text-gray-400">Amount:</span>
              <span className="font-bold text-green-600 dark:text-green-400">₹{newBooking.totalAmount}</span>
            </div>
          </div>
          <button
            onClick={() => {
              setShowNewBookingPopup(false);
              fetchBookings();
            }}
            className="mt-4 w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
          >
            View Details
          </button>
        </div>
      )}      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Turf Bookings</h1>
          
          {/* Download Monthly Summary Button */}
          {user?.role === 'turf_owner' && filteredBookings.length > 0 && (
            <button
              onClick={downloadMonthlySummary}
              className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition shadow-lg"
            >
              <FileText size={18} className="mr-2" />
              Download Monthly Summary
            </button>
          )}
        </div>

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
                    <span>{booking.customerDetails?.name || booking.user?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail size={16} className="text-gray-500" />
                    <span>{booking.customerDetails?.email || booking.user?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone size={16} className="text-gray-500" />
                    <span>{booking.customerDetails?.phone || booking.user?.phone || 'N/A'}</span>
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

                {/* Receipt Section */}
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h5 className="font-semibold mb-2">Receipt</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Booking ID:</span>
                      <span className="font-mono">#{booking._id.slice(-8)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Customer:</span>
                      <span>{booking.customerDetails?.name || booking.user?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time Slots:</span>
                      <span>{booking.slots.map(slot => `${slot.startTime}-${slot.endTime}`).join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{booking.slots.length} hour{booking.slots.length > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                      <span>Total Amount:</span>
                      <span>₹{booking.totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                </div>                {/* Action Buttons for Turf Owners */}
                {user?.role === 'turf_owner' && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => handleConfirmPayment(booking._id)}
                        className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                      >
                        <CheckCircle size={16} className="mr-2" />
                        Confirm Payment
                      </button>
                    )}
                    
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      >
                        <Undo size={16} className="mr-2" />
                        Cancel Booking
                      </button>
                    )}
                    
                    <button
                      onClick={() => downloadReceipt(booking)}
                      className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                      <Download size={16} className="mr-2" />
                      Download Receipt
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
