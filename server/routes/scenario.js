// server/routes/scenario.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/generate-scenario', async (req, res) => {
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo', // or 'gpt-4'
            messages: [
                { 
                    role: 'user', 
                    content: "Generate a narrative scenario for a space-themed adventure with two choices. Format the response as follows: 'Scenario: [description]. Choices: A) [option1] B) [option2]'" 
                }
            ],
            max_tokens: 150,
            temperature: 0.7,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
        });

        const scenarioData = response.data.choices[0].message.content.trim();
        console.log('OpenAI Scenario Response:', scenarioData); // Log the response

        // Parse the scenario and choices
        const [scenario, choices] = scenarioData.split('Choices:');
        const options = choices.split('B)'); // Split into two options
        const choiceA = options[0].trim().replace('A)', '').trim();
        const choiceB = options[1].trim();

        res.json({ scenario: scenario.trim(), choices: { A: choiceA, B: choiceB } });
    } catch (error) {
        console.error('Error generating scenario:', error);
        res.status(500).send({ error: 'Error generating scenario', details: error.message });
    }
});

module.exports = router;