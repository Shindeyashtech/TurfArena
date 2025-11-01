import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Plus, Calendar, Clock, Edit } from 'lucide-react';
import { createTurf, getTurf, updateTurf } from '../utils/api';

const CreateTurf = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    address: '',
    pricePerHour: '',
    amenities: [],
    images: [],
    availability: [],
    maintenanceDates: []
  });
  const [loading, setLoading] = useState(false);
  const [newSlots, setNewSlots] = useState([{ startTime: '', endTime: '' }]);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [maintenanceDate, setMaintenanceDate] = useState('');
  const [isFullDay, setIsFullDay] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const fetchTurf = async () => {
        try {
          const response = await getTurf(id);
          const turf = response.data;
          setFormData({
            name: turf.name || '',
            description: turf.description || '',
            location: `${turf.location.city}, ${turf.location.state}`,
            address: turf.location.address || '',
            pricePerHour: turf.pricing.basePrice.toString() || '',
            amenities: turf.amenities || [],
            images: turf.images || [],
            availability: turf.availability || [],
            maintenanceDates: turf.maintenanceDates || []
          });
        } catch (error) {
          console.error('Error fetching turf:', error);
          alert('Failed to load turf data');
        }
      };
      fetchTurf();
    }
  }, [id, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const locationParts = formData.location.split(',');
      if (locationParts.length < 2) {
        alert('Please enter location in format: City, State');
        setLoading(false);
        return;
      }

      const turfData = {
        name: formData.name,
        description: formData.description,
        location: {
          address: formData.address,
          city: locationParts[0].trim(),
          state: locationParts[1].trim(),
        },
        pricing: {
          basePrice: parseFloat(formData.pricePerHour)
        },
        amenities: formData.amenities,
        specifications: {
          pitchType: 'turf'
        },
        availability: formData.availability,
        maintenanceDates: formData.maintenanceDates
      };

      if (isEditing) {
        await updateTurf(id, turfData);
        alert('Turf updated successfully!');
      } else {
        await createTurf(turfData);
        alert('Turf created successfully!');
      }
      navigate('/turfs');
    } catch (error) {
      console.error('Error saving turf:', error);
      alert('Failed to save turf: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    // Image upload not implemented yet
  };

  const addAmenity = (amenity) => {
    if (!formData.amenities.includes(amenity)) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenity]
      });
    }
  };

  const removeAmenity = (amenity) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter(a => a !== amenity)
    });
  };

  const commonAmenities = ['Parking', 'Changing Rooms', 'Floodlights', 'Water', 'Restrooms', 'Cafeteria'];

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        {isEditing ? <Edit className="mr-3 text-green-500" /> : <MapPin className="mr-3 text-green-500" />}
        {isEditing ? 'Edit Turf' : 'Create Turf'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Turf Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
            placeholder="e.g., Green Field Turf"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
            placeholder="Describe your turf..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Location *</label>
          <input
            type="text"
            required
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
            placeholder="e.g., Mumbai, Maharashtra"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Address *</label>
          <textarea
            rows={2}
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
            placeholder="Full address of the turf"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Price per Hour (₹) *</label>
          <input
            type="number"
            required
            min="0"
            value={formData.pricePerHour}
            onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
            className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
            placeholder="e.g., 500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Amenities</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.amenities.map(amenity => (
              <span
                key={amenity}
                className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm flex items-center"
              >
                {amenity}
                <button
                  type="button"
                  onClick={() => removeAmenity(amenity)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {commonAmenities.map(amenity => (
              <button
                key={amenity}
                type="button"
                onClick={() => addAmenity(amenity)}
                className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-1 rounded-full text-sm"
              >
                + {amenity}
              </button>
            ))}
          </div>
        </div>

        {/* Availability Section */}
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center">
            <Calendar className="mr-2" size={16} />
            Availability
          </label>
          <p className="text-sm text-gray-500 mb-4">Set up available dates and time slots for bookings</p>

          {/* Date Range Selection */}
          <div className="space-y-4 p-4 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  min={dateRange.startDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                id="fullDay"
                checked={isFullDay}
                onChange={(e) => setIsFullDay(e.target.checked)}
                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="fullDay" className="text-sm font-medium text-gray-900 dark:text-gray-300">
                Full Day Available (6 AM - 11 PM)
              </label>
            </div>

            {!isFullDay && (
              <div>
                <label className="block text-sm font-medium mb-2">Time Slots</label>
                {newSlots.map((slot, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <Clock size={16} className="text-gray-500" />
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => {
                        const updatedSlots = [...newSlots];
                        updatedSlots[index].startTime = e.target.value;
                        setNewSlots(updatedSlots);
                      }}
                      className="px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"
                      placeholder="Start"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => {
                        const updatedSlots = [...newSlots];
                        updatedSlots[index].endTime = e.target.value;
                        setNewSlots(updatedSlots);
                      }}
                      className="px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"
                      placeholder="End"
                    />
                    {newSlots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setNewSlots(newSlots.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setNewSlots([...newSlots, { startTime: '', endTime: '' }])}
                  className="text-green-500 hover:text-green-700 text-sm"
                >
                  + Add another slot
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                if (!dateRange.startDate || !dateRange.endDate) {
                  alert('Please select both start and end dates');
                  return;
                }
                if (!isFullDay && newSlots.some(slot => !slot.startTime || !slot.endTime)) {
                  alert('Please fill all time slots');
                  return;
                }

                const startDate = new Date(dateRange.startDate);
                const endDate = new Date(dateRange.endDate);
                const dates = [];

                for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                  dates.push(new Date(d));
                }

                const slotsToAdd = isFullDay ? [
                  { startTime: '06:00', endTime: '07:00', isBooked: false },
                  { startTime: '07:00', endTime: '08:00', isBooked: false },
                  { startTime: '08:00', endTime: '09:00', isBooked: false },
                  { startTime: '09:00', endTime: '10:00', isBooked: false },
                  { startTime: '10:00', endTime: '11:00', isBooked: false },
                  { startTime: '11:00', endTime: '12:00', isBooked: false },
                  { startTime: '12:00', endTime: '13:00', isBooked: false },
                  { startTime: '13:00', endTime: '14:00', isBooked: false },
                  { startTime: '14:00', endTime: '15:00', isBooked: false },
                  { startTime: '15:00', endTime: '16:00', isBooked: false },
                  { startTime: '16:00', endTime: '17:00', isBooked: false },
                  { startTime: '17:00', endTime: '18:00', isBooked: false },
                  { startTime: '18:00', endTime: '19:00', isBooked: false },
                  { startTime: '19:00', endTime: '20:00', isBooked: false },
                  { startTime: '20:00', endTime: '21:00', isBooked: false },
                  { startTime: '21:00', endTime: '22:00', isBooked: false },
                  { startTime: '22:00', endTime: '23:00', isBooked: false }
                ] : newSlots.map(slot => ({
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                  isBooked: false
                }));

                const newAvailabilities = dates.map(date => ({
                  date: date.toISOString().split('T')[0],
                  slots: slotsToAdd
                }));

                setFormData({
                  ...formData,
                  availability: [...formData.availability, ...newAvailabilities]
                });

                setDateRange({ startDate: '', endDate: '' });
                setNewSlots([{ startTime: '', endTime: '' }]);
                setIsFullDay(false);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
            >
              Add Date Range & Slots
            </button>
          </div>

          {/* Maintenance and Booking Dates */}
          <div className="space-y-4 p-4 border dark:border-gray-600 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                Maintenance & Booking Management
              </label>
              <p className="text-sm text-gray-500 mb-2">Select dates for maintenance or mark dates as fully booked</p>
              <input
                type="date"
                value={maintenanceDate}
                onChange={(e) => setMaintenanceDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
              />
              <div className="flex space-x-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!maintenanceDate) {
                      alert('Please select a date');
                      return;
                    }
                    if (formData.maintenanceDates.includes(maintenanceDate)) {
                      alert('This date is already marked for maintenance');
                      return;
                    }
                    setFormData({
                      ...formData,
                      maintenanceDates: [...formData.maintenanceDates, maintenanceDate]
                    });
                    setMaintenanceDate('');
                  }}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm"
                >
                  Mark as Maintenance
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!maintenanceDate) {
                      alert('Please select a date');
                      return;
                    }
                    // Check if date already exists in availability
                    const existingAvailabilityIndex = formData.availability.findIndex(
                      avail => avail.date === maintenanceDate
                    );

                    if (existingAvailabilityIndex !== -1) {
                      // Update existing availability to mark all slots as booked
                      const updatedAvailability = [...formData.availability];
                      updatedAvailability[existingAvailabilityIndex].slots = updatedAvailability[existingAvailabilityIndex].slots.map(slot => ({
                        ...slot,
                        isBooked: true
                      }));
                      setFormData({
                        ...formData,
                        availability: updatedAvailability
                      });
                    } else {
                      // Create new availability entry with all slots booked
                      const bookedSlots = [
                        { startTime: '06:00', endTime: '07:00', isBooked: true },
                        { startTime: '07:00', endTime: '08:00', isBooked: true },
                        { startTime: '08:00', endTime: '09:00', isBooked: true },
                        { startTime: '09:00', endTime: '10:00', isBooked: true },
                        { startTime: '10:00', endTime: '11:00', isBooked: true },
                        { startTime: '11:00', endTime: '12:00', isBooked: true },
                        { startTime: '12:00', endTime: '13:00', isBooked: true },
                        { startTime: '13:00', endTime: '14:00', isBooked: true },
                        { startTime: '14:00', endTime: '15:00', isBooked: true },
                        { startTime: '15:00', endTime: '16:00', isBooked: true },
                        { startTime: '16:00', endTime: '17:00', isBooked: true },
                        { startTime: '17:00', endTime: '18:00', isBooked: true },
                        { startTime: '18:00', endTime: '19:00', isBooked: true },
                        { startTime: '19:00', endTime: '20:00', isBooked: true },
                        { startTime: '20:00', endTime: '21:00', isBooked: true },
                        { startTime: '21:00', endTime: '22:00', isBooked: true },
                        { startTime: '22:00', endTime: '23:00', isBooked: true }
                      ];
                      setFormData({
                        ...formData,
                        availability: [...formData.availability, {
                          date: maintenanceDate,
                          slots: bookedSlots
                        }]
                      });
                    }
                    setMaintenanceDate('');
                    alert('Date marked as fully booked!');
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                >
                  Mark as Booked
                </button>
              </div>
            </div>

            {formData.maintenanceDates.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-yellow-700 dark:text-yellow-300">Maintenance Dates:</h4>
                {formData.maintenanceDates.map((date, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-yellow-100 dark:bg-yellow-800 rounded-lg">
                    <span className="text-yellow-800 dark:text-yellow-200">{new Date(date).toLocaleDateString()}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          maintenanceDates: formData.maintenanceDates.filter((_, i) => i !== index)
                        });
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Display Added Availability */}
          <div>
            {formData.availability.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium">Added Availability:</h4>
                {formData.availability.map((avail, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
                    <div>
                      <span className="font-medium">{new Date(avail.date).toLocaleDateString()}</span>
                      <div className="text-sm text-gray-500">
                        {avail.slots.map((slot, slotIndex) => (
                          <span key={slotIndex} className="mr-2">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          availability: formData.availability.filter((_, i) => i !== index)
                        });
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
          />
          <p className="text-sm text-gray-500 mt-1">Upload multiple images of your turf</p>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            <Plus size={20} />
            <span>{loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Turf' : 'Create Turf')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTurf;
