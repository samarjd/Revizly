const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');  // Add this import

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const User = require('./models/User'); // Assuming you have a User model
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const bcrypt = require('bcrypt');

// Middleware to parse incoming request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected')).catch((err) => console.log(err));

// Setup file upload storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // Store files in the 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // Generate a unique filename based on timestamp
    }
});

const upload = multer({ storage });  // Initialize multer with storage settings

// Middleware to authenticate JWT token
const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1]; // "Bearer <token>"
    
    if (!token) {
        return res.status(403).send('Token is required');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Invalid token
        }

        req.user = user; // Add user to request object
        next();
    });
};

// Create a new conversation
app.post('/conversations', authenticateJWT, async (req, res) => {
    try {
        const newConversation = new Conversation({
            conversationTitle: req.body.conversationTitle || 'New Conversation',
            timestamp: new Date(),
            userId: req.user.id,
        });
        await newConversation.save();
        res.status(201).json(newConversation);
    } catch (error) {
        res.status(400).json({ error: 'Error creating conversation' });
    }
});

// Get all conversations for the logged-in user
app.get('/conversations', authenticateJWT, async (req, res) => {
    try {
        const conversations = await Conversation.find({ userId: req.user.id });
        res.json({ conversations });
    } catch (error) {
        res.status(400).json({ error: 'Error fetching conversations' });
    }
});

// Edit a conversation title
app.put('/conversations/:id', authenticateJWT, async (req, res) => {
    const conversationId = req.params.id;
    const { conversationTitle } = req.body;

    try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        conversation.conversationTitle = conversationTitle;
        await conversation.save();

        res.json(conversation);
    } catch (error) {
        res.status(400).json({ error: 'Error updating conversation' });
    }
});

// Get messages for a specific conversation
app.get('/conversations/:conversationId/messages', authenticateJWT, async (req, res) => {
    try {
        const messages = await Message.find({ conversationId: req.params.conversationId });
        res.json({ messages });
    } catch (error) {
        res.status(400).json({ error: 'Error fetching messages' });
    }
});

// Send a new message to a conversation
app.post('/messages', authenticateJWT, upload.single('file'), async (req, res) => {
    try {
        const { message, conversationId, sender } = req.body;

        // Check if conversationId is provided and valid
        if (!conversationId) {
            return res.status(400).json({ error: 'Conversation ID is required' });
        }

        // Validate the conversationId to check if it exists in the database
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Determine sender ID and message type
        const senderId = sender === 'user' ? req.user.id : null; // Associate the user ID if the sender is 'user'
        
        if (!message && !req.file && sender !== 'bot') {
            return res.status(400).json({ error: 'Text or file must be provided' });
        }

        // Prepare file location if a file was uploaded
        let fileLocation = null;
        if (req.file) {
            fileLocation = `uploads/${req.file.filename}`;  // Store the relative path to the file (URL format)
        }

        // Create a new message object
        const newMessage = new Message({
            sender,            // 'user' or 'bot'
            senderId,          // senderId (user ID or null for bot)
            message: message,     // Message content from the request
            fileLocation,      // File URL (relative path) if file is uploaded
            conversationId: conversation._id,  // Ensure the conversationId is correct
            botResponse: sender === 'bot' ? 
                (req.body.botResponse ? req.body.botResponse : {
                    answer: null,
                    question: null,
                    paragraph: null,
                    options: [],
                }) : undefined,     // If the sender is not bot, leave this undefined
        });

        // Save the message to the database
        await newMessage.save();

        // Respond with the created message
        res.status(201).json(newMessage);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete all messages for a conversation
app.delete('/conversations/:id/messages', authenticateJWT, async (req, res) => {
    const conversationId = req.params.id;

    try {
        // Delete all messages related to the conversation
        await Message.deleteMany({ conversationId });

        // Optionally, if you also want to delete files associated with the messages, 
        // you would include logic to remove files here (e.g., from cloud storage or server disk).

        res.status(200).send({ message: 'Messages deleted successfully.' });
    } catch (error) {
        console.error('Error deleting messages:', error);
        res.status(500).send({ error: 'Failed to delete messages' });
    }
});

// Delete a conversation
app.delete('/conversations/:id', authenticateJWT, async (req, res) => {
    const conversationId = req.params.id;

    try {
        // Delete the conversation from the database
        const conversation = await Conversation.findByIdAndDelete(conversationId);
        
        if (!conversation) {
            return res.status(404).send({ error: 'Conversation not found' });
        }

        // Delete all associated messages
        await Message.deleteMany({ conversationId });

        // Optionally, if there are files associated with the conversation, 
        // you would delete those files from cloud storage or your server here.

        res.status(200).send({ message: 'Conversation and its messages deleted successfully.' });
    } catch (error) {
        console.error('Error deleting conversation:', error);
        res.status(500).send({ error: 'Failed to delete conversation' });
    }
});

// Login route for generating JWT tokens
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email });
        
        if (!user || !bcrypt.compare(password, user.password)) { // Make sure to hash passwords in production
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Create JWT token
        const token = jwt.sign({ 
            id: user._id,
            email: user.email,
        }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Signup Route
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save the new user
        const newUser = new User({
            email,
            password: hashedPassword,
            creationDate: new Date(),
        });
        await newUser.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
