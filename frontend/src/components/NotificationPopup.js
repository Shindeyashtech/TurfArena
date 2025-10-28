import React, { useEffect, useState } from 'react';
import { Bell, X, Calendar, DollarSign } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const NotificationPopup = () => {
  const [notification, setNotification] = useState(null);
  const [show, setShow] = useState(false);
  const socket = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (socket && user) {
      socket.on('notification', (data) => {
        // Only show popup for new_booking notifications to turf owners
        if (user.role === 'turf_owner' && data.type === 'new_booking') {
          setNotification(data);
          setShow(true);

          // Auto-hide after 10 seconds
          setTimeout(() => {
            setShow(false);
          }, 10000);
        }
      });

      return () => {
        socket.off('notification');
      };
    }
  }, [socket, user]);

  const handleViewDetails = () => {
    if (notification?.actionUrl) {
      navigate(notification.actionUrl);
    }
    setShow(false);
  };

  const handleClose = () => {
    setShow(false);
  };

  if (!show || !notification) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 animate-in slide-in-from-right-2">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Calendar className="text-orange-500" size={24} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <p className="font-semibold text-sm">{notification.title}</p>
              <button
                onClick={handleClose}
                className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {notification.message}
            </p>

            {notification.data && (
              <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-900 rounded text-xs">
                <p><strong>Customer:</strong> {notification.data.customerName}</p>
                <p><strong>Amount:</strong> ₹{notification.data.totalAmount}</p>
                <p><strong>Date:</strong> {new Date(notification.data.bookingDate).toLocaleDateString()}</p>
              </div>
            )}

            <div className="mt-3 flex space-x-2">
              <button
                onClick={handleViewDetails}
                className="flex-1 px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition"
              >
                View Details
              </button>
              <button
                onClick={handleClose}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;
