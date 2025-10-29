import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Phone, Mail } from 'lucide-react';
import { getTurf, createOfflineBooking } from '../utils/api';

const OfflineBookingModal = ({ isOpen, onClose, turfId, onBookingCreated }) => {
  const [turf, setTurf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bookingDate: '',
    selectedSlots: [],
    customerDetails: {
      name: '',
      email: '',
      phone: ''
    },
    notes: ''
  });

  useEffect(() => {
    if (isOpen && turfId) {
      fetchTurfDetails();
    }
  }, [isOpen, turfId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTurfDetails = async () => {
    try {
      const res = await getTurf(turfId);
      setTurf(res.data);
    } catch (error) {
      console.error('Error fetching turf details:', error);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSlotSelection = (slot) => {
    const slotKey = `${slot.startTime}-${slot.endTime}`;
    const isSelected = formData.selectedSlots.includes(slotKey);

    if (isSelected) {
      setFormData(prev => ({
        ...prev,
        selectedSlots: prev.selectedSlots.filter(s => s !== slotKey)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        selectedSlots: [...prev.selectedSlots, slotKey]
      }));
    }
  };

  const calculateTotalAmount = () => {
    return formData.selectedSlots.length * (turf?.pricing?.basePrice || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.bookingDate || formData.selectedSlots.length === 0) {
      alert('Please select a date and at least one slot');
      return;
    }

    if (!formData.customerDetails.name || !formData.customerDetails.phone) {
      alert('Customer name and phone are required');
      return;
    }

    try {
      setLoading(true);

      const slots = formData.selectedSlots.map(slotKey => {
        const [startTime, endTime] = slotKey.split('-');
        return { startTime, endTime };
      });

      const bookingData = {
        turf: turfId,
        bookingDate: formData.bookingDate,
        slots,
        totalAmount: calculateTotalAmount(),
        customerDetails: formData.customerDetails,
        notes: formData.notes,
        isOffline: true
      };

      // Call the API to create offline booking
      const result = await createOfflineBooking(bookingData);

      alert('Offline booking created successfully!');
      onBookingCreated(result.booking);
      onClose();

      // Reset form
      setFormData({
        bookingDate: '',
        selectedSlots: [],
        customerDetails: {
          name: '',
          email: '',
          phone: ''
        },
        notes: ''
      });

    } catch (error) {
      console.error('Error creating offline booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const availableSlots = turf?.availability?.find(
    a => new Date(a.date).toISOString().split('T')[0] === formData.bookingDate
  )?.slots || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Create Offline Booking</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Booking Details */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Calendar size={16} className="inline mr-2" />
                  Booking Date *
                </label>
                <input
                  type="date"
                  value={formData.bookingDate}
                  onChange={(e) => handleInputChange('bookingDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              {/* Customer Details */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Customer Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <User size={16} className="inline mr-2" />
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.customerDetails.name}
                      onChange={(e) => handleInputChange('customerDetails.name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                      placeholder="Customer name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <Phone size={16} className="inline mr-2" />
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={formData.customerDetails.phone}
                      onChange={(e) => handleInputChange('customerDetails.phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                      placeholder="Phone number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <Mail size={16} className="inline mr-2" />
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={formData.customerDetails.email}
                      onChange={(e) => handleInputChange('customerDetails.email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                      placeholder="customer@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  rows="3"
                  placeholder="Any additional notes..."
                />
              </div>
            </div>

            {/* Right Column - Slot Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Select Time Slots</h3>
              {formData.bookingDate ? (
                <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {availableSlots.map((slot, index) => {
                    const isBooked = slot.isBooked;
                    const isSelected = formData.selectedSlots.includes(`${slot.startTime}-${slot.endTime}`);

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => !isBooked && handleSlotSelection(slot)}
                        disabled={isBooked}
                        className={`p-3 rounded-lg border-2 transition text-left ${
                          isSelected
                            ? 'border-green-500 bg-green-50 dark:bg-green-900'
                            : isBooked
                            ? 'border-red-300 bg-red-50 dark:bg-red-900 cursor-not-allowed'
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Clock size={16} />
                          <span className="font-medium">{slot.startTime} - {slot.endTime}</span>
                        </div>
                        {isBooked && (
                          <span className="text-sm text-red-500">Booked</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Please select a date to view available slots
                </p>
              )}
            </div>
          </div>

          {/* Booking Summary */}
          {formData.selectedSlots.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-semibold mb-3">Booking Summary</h4>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg">Selected Slots: {formData.selectedSlots.length}</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Total Amount: ₹{calculateTotalAmount()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Payment: Cash (Offline)</p>
                  <p className="text-sm text-green-600 font-medium">Status: Confirmed</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || formData.selectedSlots.length === 0}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfflineBookingModal;
