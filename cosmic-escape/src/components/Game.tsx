// src/components/Game.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Game: React.FC = () => {
    const [scenario, setScenario] = useState<string>('');
    const [choices, setChoices] = useState<{ A: string; B: string }>({ A: '', B: '' });
    const [score, setScore] = useState<number>(0);
    const [timer, setTimer] = useState<number>(180); // Start at 3 minutes (180 seconds)
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [feedback, setFeedback] = useState<string>('');
    const [scenarios, setScenarios] = useState<any[]>([]); // Define scenarios as state
    const [currentScenarioIndex, setCurrentScenarioIndex] = useState<number>(0); // Track current scenario index

    useEffect(() => {
        startGame(); // Start the game when the component mounts
    }, []);

    const startGame = async () => {
        try {
            const response = await axios.post('http://localhost:4000/api/start-game'); // Start the game and generate scenarios
            setScenarios(response.data.scenarios); // Set the scenarios state
            requestNewScenario(); // Fetch the first scenario after starting the game
            const countdown = setInterval(() => {
                setTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(countdown);
                        setGameOver(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000); // Decrease timer every second

            return () => clearInterval(countdown); // Cleanup interval on unmount
        } catch (error) {
            console.error('Error starting game:', error);
            setFeedback("Error starting game. Please try again.");
        }
    };

    const requestNewScenario = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/current-scenario');
            setScenario(response.data.scenario);
            setChoices(response.data.choices);
        } catch (error) {
            console.error('Error fetching scenario:', error);
            setFeedback("Error fetching scenario. Please try again.");
        }
    };

    const handleChoice = async (choice: 'A' | 'B') => {
        // Get the correct answer from the current scenario
        const correctAnswer = scenarios[currentScenarioIndex]?.correctAnswer; // Access the correct answer safely

        if (choice === correctAnswer) { // Check if the player's choice matches the correct answer
            setScore(prev => prev + 1);
            setFeedback("Good choice! Moving forward.");
        } else {
            setFeedback("Oops! That choice set you back.");
            setTimer(prev => Math.max(prev - 10, 0)); // Deduct 10 seconds
        }

        // Request the next scenario after making a choice
        await axios.post('http://localhost:4000/api/next-scenario');
        setCurrentScenarioIndex(prev => prev + 1); // Increment the current scenario index
        requestNewScenario();
    };

    if (gameOver) {
        return (
            <div>
                <h2>Game Over! Your score: {score}</h2>
                <button onClick={() => {
                    setGameOver(false);
                    setScore(0);
                    setTimer(180); // Reset timer to 3 minutes
                    startGame(); // Restart the game
                }}>
                    Restart Game
                </button>
            </div>
        );
    }

    return (
        <div>
            <h1>Cosmic Escape</h1>
            <h2>Time Left: {timer}s</h2>
            <h2>Score: {score}</h2>
            <h3>{scenario}</h3>
            <div>
                <button onClick={() => handleChoice('A')}>{choices.A}</button>
                <button onClick={() => handleChoice('B')}>{choices.B}</button>
            </div>
            {feedback && <p>{feedback}</p>} {/* Display feedback message */}
        </div>
    );
};

export default Game;