// server/models/Player.js
const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    score: { type: Number, default: 0 },
    timeLeft: { type: Number, default: 60 },
    scenariosCompleted: { type: Number, default: 0 },
});

module.exports = mongoose.model('Player', playerSchema);