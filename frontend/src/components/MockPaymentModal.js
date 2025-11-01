// Frontend: src/components/MockPaymentModal.js
import React, { useState } from 'react';
import { CreditCard, X, CheckCircle } from 'lucide-react';

const MockPaymentModal = ({ isOpen, onClose, amount, onSuccess, orderId }) => {
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const handlePayment = async () => {
    // Validate required fields
    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      alert('Please fill in all required fields (Name, Email, Phone)');
      return;
    }

    setProcessing(true);

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock payment always succeeds
    const mockPaymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mockSignature = Math.random().toString(36).substr(2, 32);

    onSuccess({
      razorpayOrderId: orderId,
      razorpayPaymentId: mockPaymentId,
      razorpaySignature: mockSignature,
      customerDetails: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone
      }
    });

    setProcessing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <CreditCard className="mr-2 text-green-500" />
            Payment Gateway (Mock)
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Demo Mode:</strong> This is a simulated payment gateway. Use any card details.
          </p>
        </div>

        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Amount to Pay:</span>
            <span className="text-2xl font-bold text-green-500">₹{amount}</span>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name *</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email Address *</label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Phone Number *</label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="Enter your phone number"
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
              maxLength="10"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Card Number</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
              placeholder="1234 5678 9012 3456"
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
              maxLength="19"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cardholder Name</label>
            <input
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="JOHN DOE"
              className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Expiry Date</label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="MM/YY"
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
                maxLength="5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">CVV</label>
              <input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                placeholder="123"
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700"
                maxLength="3"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={processing}
          className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 font-semibold flex items-center justify-center"
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2" size={20} />
              Pay ₹{amount}
            </>
          )}
        </button>

        <p className="text-xs text-center text-gray-500 mt-4">
          Secure mock payment • For demo purposes only
        </p>
      </div>
    </div>
  );
};

export default MockPaymentModal;
