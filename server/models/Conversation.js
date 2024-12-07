const mongoose = require('mongoose');
const messageSchema = require('./Message'); // Assuming messageSchema is in a separate file

// Define the schema for the conversation
const conversationSchema = new mongoose.Schema({

    conversationTitle: {
        type: String,
        required: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    timestamp: {
        type: Date,
        default: Date.now, // Automatically set the timestamp when the conversation is created
    },
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
