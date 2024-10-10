// server/routes/question.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/generate-question', async (req, res) => {
    try {
        const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
            prompt: "Generate a space-themed trivia question with four multiple choice answers.",
            max_tokens: 100,
            n: 1,
            stop: null,
            temperature: 0.7,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
        });

        const questionData = response.data.choices[0].text.trim();
        
        // Example parsing logic (you may need to adjust this based on the actual response format)
        const lines = questionData.split('\n');
        const question = lines[0]; // First line is the question
        const answers = lines.slice(1); // Subsequent lines are the answers

        res.json({ question, answers });
    } catch (error) {
        console.error('Error generating question:', error);
        res.status(500).send('Error generating question');
    }
});

module.exports = router;