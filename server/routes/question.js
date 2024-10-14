// server/routes/question.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/generate-question', async (req, res) => {
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo', // or 'gpt-4'
            messages: [
                { 
                    role: 'user', 
                    content: "Create a space-themed trivia question with four distinct answer options formatted as follows: A) Option1 B) Option2 C) Option3 D) Option4. Ensure that one of the options is the correct answer." 
                }
            ],
            max_tokens: 100,
            temperature: 0.7,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
        });

        const questionData = response.data.choices[0].message.content.trim();
        console.log('OpenAI Response:', questionData); // Log the response

        const lines = questionData.split('\n').filter(line => line.trim() !== ""); // Filter out empty lines
        const question = lines[0]; // First line is the question
        const answers = lines.slice(1).map(line => line.trim()).filter(line => line.startsWith('A)') || line.startsWith('B)') || line.startsWith('C)') || line.startsWith('D)')); // Only keep lines that start with A), B), C), or D)

        // Check if the question and answers are valid
        if (!question || answers.length < 4) {
            console.error('Invalid question or answers:', { question, answers }); // Log invalid question/answers
            return res.status(500).send('Invalid question format received from OpenAI');
        }

        // Assuming you want to randomly select one of the answers as the correct answer
        const correctAnswer = answers[Math.floor(Math.random() * answers.length)]; // Randomly select a correct answer

        res.json({ question, answers, correctAnswer }); // Send back the question, answers, and correct answer
    } catch (error) {
        console.error('Error generating question:', error);
        res.status(500).send({ error: 'Error generating question', details: error.message });
    }
});

module.exports = router;