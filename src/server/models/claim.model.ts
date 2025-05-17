
import mongoose from 'mongoose';

// Claim Schema
const claimSchema = new mongoose.Schema({
  claim_number: {
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
  claim_amount: {
    type: Number,
    required: true,
    min: 0,
  },
  claim_date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  incident_date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Approved', 'Rejected', 'Paid'],
    default: 'Pending',
  },
  description: {
    type: String,
    required: true,
  },
  supporting_documents: [{
    document_type: String,
    document_url: String,
    uploaded_at: {
      type: Date,
      default: Date.now,
    },
  }],
  notes: [{
    content: String,
    added_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    added_at: {
      type: Date,
      default: Date.now,
    },
  }],
  rejection_reason: {
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
claimSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Create Claim model
const ClaimModel = mongoose.model('Claim', claimSchema);

export default ClaimModel;
