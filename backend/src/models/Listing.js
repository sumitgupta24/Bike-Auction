const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  description: { type: String },
  photoUrl: { type: String },
  status: { type: String, enum: ['draft', 'approved'], default: 'draft' }
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);
