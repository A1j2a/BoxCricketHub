import RazorpayCheckout from 'react-native-razorpay';
import { Alert } from 'react-native';

class RazorpayService {
  constructor() {
    this.keyId = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID;
  }

  async createOrder(amount, currency = 'INR', receipt = null) {
    try {
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Razorpay expects amount in paise
          currency,
          receipt: receipt || `receipt_${Date.now()}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const order = await response.json();
      return order;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  }

  async processPayment(options) {
    return new Promise((resolve, reject) => {
      const razorpayOptions = {
        description: options.description || 'BoxCricketHub Booking',
        image: options.image || 'https://your-logo-url.com/logo.png',
        currency: options.currency || 'INR',
        key: this.keyId,
        amount: options.amount,
        order_id: options.orderId,
        name: options.name || 'BoxCricketHub',
        prefill: {
          email: options.email || '',
          contact: options.contact || '',
          name: options.customerName || '',
        },
        theme: { color: '#1B5E20' }, // Cricket green theme
      };

      RazorpayCheckout.open(razorpayOptions)
        .then((data) => {
          // Payment successful
          resolve({
            success: true,
            paymentId: data.razorpay_payment_id,
            orderId: data.razorpay_order_id,
            signature: data.razorpay_signature,
          });
        })
        .catch((error) => {
          // Payment failed or cancelled
          if (error.code === RazorpayCheckout.PAYMENT_CANCELLED) {
            reject({
              success: false,
              error: 'Payment was cancelled by user',
              code: 'PAYMENT_CANCELLED',
            });
          } else {
            reject({
              success: false,
              error: error.description || 'Payment failed',
              code: error.code || 'PAYMENT_FAILED',
            });
          }
        });
    });
  }

  async verifyPayment(paymentData) {
    try {
      const response = await fetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  async initiateBookingPayment(bookingDetails) {
    try {
      // Create order first
      const order = await this.createOrder(
        bookingDetails.amount,
        'INR',
        `booking_${bookingDetails.slotId}_${Date.now()}`
      );

      // Process payment
      const paymentResult = await this.processPayment({
        orderId: order.id,
        amount: order.amount,
        description: `Cricket Ground Booking - ${bookingDetails.venueName}`,
        customerName: bookingDetails.userName,
        email: bookingDetails.userEmail,
        contact: bookingDetails.userPhone,
      });

      // Verify payment
      const verification = await this.verifyPayment({
        paymentId: paymentResult.paymentId,
        orderId: paymentResult.orderId,
        signature: paymentResult.signature,
      });

      if (verification.verified) {
        return {
          success: true,
          paymentId: paymentResult.paymentId,
          orderId: paymentResult.orderId,
          verified: true,
        };
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Booking payment failed:', error);
      throw error;
    }
  }
}

export default new RazorpayService();