// server/routes/scenario.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

let scenarios = []; // Array to hold the generated scenarios
let currentScenarioIndex = 0; // Track the current scenario index

// Function to generate scenarios
const generateScenarios = async () => {
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo', 
            messages: [
                { 
                    role: 'user', 
                    content: "Generate a sequence of 30 short scenarios for a space-themed adventure on a spaceship. Each scenario should have two choices (A and B). Randomly assign one of them as the correct answer. Format the response as follows: 'Scenario: [description]. Choices: A) [option1] (correct) B) [option2]' or 'Scenario: [description]. Choices: A) [option1] B) [option2] (correct)'" 
                }
            ],
            max_tokens: 1500, 
            temperature: 0.7,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
        });

        const scenarioData = response.data.choices[0].message.content.trim();
        console.log('OpenAI Scenario Response:', scenarioData);

        // Parse the scenarios
        const scenarioLines = scenarioData.split('\n');
        scenarios = scenarioLines.map(line => {
            const [scenario, choices] = line.split('Choices:');
            const options = choices.split('B)');
            const choiceA = options[0].trim().replace('A)', '').trim();
            const choiceB = options[1].trim();

            // Determine which choice is correct
            let correctAnswer;
            if (choiceA.includes('(correct)')) {
                correctAnswer = 'A';
            } else if (choiceB.includes('(correct)')) {
                correctAnswer = 'B';
            } else {
                // Randomly assign correct answer if not marked
                correctAnswer = Math.random() < 0.5 ? 'A' : 'B';
            }

            return {
                scenario: scenario.trim(),
                choices: { A: choiceA.replace(' (correct)', ''), B: choiceB.replace(' (correct)', '') },
                correctAnswer
            };
        });
    } catch (error) {
        console.error('Error generating scenarios:', error);
    }
};

// Route to start the game and generate scenarios
router.post('/start-game', async (req, res) => {
    await generateScenarios(); // Generate scenarios when the game starts
    currentScenarioIndex = 0; // Reset the scenario index
    console.log('Scenarios generated:', scenarios); // Log the generated scenarios
    res.json({ message: 'Game started', scenarios });
});

// Route to get the current scenario
router.get('/current-scenario', (req, res) => {
    if (currentScenarioIndex < scenarios.length) {
        res.json(scenarios[currentScenarioIndex]);
    } else {
        res.status(404).send('No more scenarios');
    }
});

// Route to advance to the next scenario
router.post('/next-scenario', (req, res) => {
    currentScenarioIndex++;
    if (currentScenarioIndex < scenarios.length) {
        res.json(scenarios[currentScenarioIndex]);
    } else {
        res.status(404).send('No more scenarios');
    }
});

module.exports = router;