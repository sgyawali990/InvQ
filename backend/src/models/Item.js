const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      default: 0
    },
    reorderThreshold: {
      type: Number,
      default: 0
    },
    lastAlertSentAt: {
      type: Date,
      default: null
    },
    category: {
      type: String
    },

    updateLogs: [
      {
        change: Number,
        date: { type: Date, default: Date.now }
      }
    ],
    expirationDate: {
        type: Date,
        required: false
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Item', itemSchema);