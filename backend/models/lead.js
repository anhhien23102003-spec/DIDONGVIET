const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  interestedModel: { type: String, default: 'Chưa chọn' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lead', LeadSchema);