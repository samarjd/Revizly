const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
    enum: ['user', 'bot'],
  },

  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function () {
      return this.sender === 'user';
    },
  },

  message: {
    type: String,
    resuired: false,
  },

  fileLocation: {
    type: String,
    required: false,
  },

  botResponse: {
    answer: {
      type: String,
    },
    question: {
      type: String,
    },
    paragraph: {
      type: String,
    },
    options: {
      type: Array,
    },
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Message', messageSchema);
