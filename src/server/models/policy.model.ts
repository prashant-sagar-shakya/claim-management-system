
import mongoose from 'mongoose';

// Policy Schema
const policySchema = new mongoose.Schema({
  policy_number: {
    type: String,
    required: true,
    unique: true,
  },
  policyholder_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  policy_type: {
    type: String,
    required: true,
    enum: ['Health', 'Auto', 'Home', 'Life', 'Travel', 'Business'],
  },
  coverage_amount: {
    type: Number,
    required: true,
    min: 0,
  },
  premium_amount: {
    type: Number,
    required: true,
    min: 0,
  },
  start_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
    required: true,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
    trim: true,
  },
  terms_conditions: {
    type: String,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
policySchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Create Policy model
const PolicyModel = mongoose.model('Policy', policySchema);

export default PolicyModel;
