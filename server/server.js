require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const scenarioRoutes = require('./routes/scenario');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// CORS options for both Express and Socket.IO
const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:5174'], // Allow both origins
    methods: ['GET', 'POST'],
    allowedHeaders: ['my-custom-header'],
    credentials: true
};

// Apply CORS middleware to Express
app.use(cors(corsOptions));
app.use('/api', scenarioRoutes);

// Initialize Socket.IO with CORS options
const io = socketIo(server, {
    cors: corsOptions // Use the same CORS options
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit the process with failure
    });

// Basic route
app.get('/', (req, res) => {
    res.send('Cosmic Escape API');
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('requestPuzzle', async () => {
        const puzzle = await generatePuzzle();
        socket.emit('newPuzzle', puzzle);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));