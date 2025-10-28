import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus } from 'lucide-react';
import { createTurf } from '../utils/api';

const CreateTurf = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    address: '',
    pricePerHour: '',
    amenities: [],
    images: []
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const turfData = {
        name: formData.name,
        description: formData.description,
        location: {
          address: formData.address,
          city: formData.location.split(',')[0].trim(),
          state: formData.location.split(',')[1]?.trim() || '',
        },
        pricing: {
          basePrice: parseFloat(formData.pricePerHour)
        },
        amenities: formData.amenities,
        specifications: {
          pitchType: 'turf'
        }
      };

      await createTurf(turfData);
      alert('Turf created successfully!');
      navigate('/turfs');
    } catch (error) {
      console.error('Error creating turf:', error);
      alert('Failed to create turf');
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
        <MapPin className="mr-3 text-green-500" />
        Create Turf
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
            <span>{loading ? 'Creating...' : 'Create Turf'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTurf;
