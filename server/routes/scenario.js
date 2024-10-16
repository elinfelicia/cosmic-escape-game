// server/routes/scenario.js
const express = require('express');
const axios = require('axios');
const router = express.Router();
const mongoose = require('mongoose');

let scenarios = []; // Array to hold the generated scenarios
let currentScenarioIndex = 0; // Track the current scenario index

const scenarioSchema = new mongoose.Schema({
    scenario: { type: String, required: true },
    choices: {
        A: { type: String, required: true },
        B: { type: String, required: true },
    },
    correctAnswer: { type: String, required: true },
});

module.exports = mongoose.model('Scenario', scenarioSchema);

// Function to generate scenarios
const generateScenarios = async () => {
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo', 
            messages: [
                { 
                    role: 'user', 
                    content: "Generate a sequence of 30 short scenarios, all taking place in the corridor of a spaceship filled with dangers and enemies. The player’s goal is to move through the ship towards the exit by making the correct choice in each scenario. Each scenario should have two choices (A and B), and one of these should be marked as the correct answer by adding '(correct)' to it. Randomly alternate between marking A or B as correct for each scenario. Ensure that the selection of A or B as correct is unpredictable and varies throughout the sequence. Format each response as follows: 'Scenario: [description]. Choices: A) [option1] B) [option2]'."
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
        const scenarioLines = scenarioData.split('\n').filter(line => line.trim() !== ''); // Filter out empty lines

        scenarios = scenarioLines.map(line => {
            // Ensure we have both scenario and choices parts
            const [scenarioPart, choicesPart] = line.split('Choices:');
            if (!scenarioPart || !choicesPart) return null;

            // Trim and sanitize scenario text
            const scenario = scenarioPart.replace('Scenario:', '').trim();

            // Extract and clean up choices
            const options = choicesPart.split('B)');
            const choiceA = options[0] ? options[0].replace(/A\)/, '').trim() : 'Choice A not available';
            const choiceB = options[1] ? options[1].replace(/B\)/, '').replace('(correct)', '').trim() : 'Choice B not available';

            // Determine correct answer based on "(correct)" keyword
            let correctAnswer;
            if (choiceA.includes('(correct)')) {
                correctAnswer = 'A';
                choiceA = choiceA.replace('(correct)', '').trim(); // Remove the marker from the choice
            } else if (choiceB.includes('(correct)')) {
                correctAnswer = 'B';
                choiceB = choiceB.replace('(correct)', '').trim(); // Remove the marker from the choice
            } else {
                // Randomly assign correct answer if neither is marked
                correctAnswer = Math.random() < 0.5 ? 'A' : 'B';
            }

            console.log(`Scenario: ${scenario}, Choices: A) ${choiceA}, B) ${choiceB}, Correct Answer: ${correctAnswer}`); // Debugging output

            return {
                scenario: scenario,
                choices: { A: choiceA, B: choiceB },
                correctAnswer
            };
        }).filter(scenario => scenario !== null); // Filter out any null scenarios

        console.log('Parsed Scenarios:', scenarios); // Log parsed scenarios for debugging

    } catch (error) {
        console.error('Error generating scenarios:', error);
    }
};

console.log('Using OpenAI API Key:', process.env.OPENAI_API_KEY);

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
