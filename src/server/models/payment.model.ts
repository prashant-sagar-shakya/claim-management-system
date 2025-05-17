
import mongoose from 'mongoose';

// Payment Schema
const paymentSchema = new mongoose.Schema({
  payment_number: {
    type: String,
    required: true,
    unique: true,
  },
  policy_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Policy',
    required: true,
  },
  policyholder_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  payment_type: {
    type: String,
    enum: ['Credit Card', 'Debit Card', 'Bank Transfer', 'Cash', 'Check', 'Other'],
    required: true,
  },
  payment_date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Completed',
  },
  transaction_id: {
    type: String,
  },
  description: {
    type: String,
  },
  receipt_url: {
    type: String,
  },
  processed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  processed_at: {
    type: Date,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

// Update the updated_at field before updating
paymentSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Create Payment model
const PaymentModel = mongoose.model('Payment', paymentSchema);

export default PaymentModel;
