// src/components/Game.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Game: React.FC = () => {
    const [scenario, setScenario] = useState<string>('');
    const [choices, setChoices] = useState<{ A: string; B: string }>({ A: '', B: '' });
    const [score, setScore] = useState<number>(0);
    const [timer, setTimer] = useState<number>(60);
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [feedback, setFeedback] = useState<string>('');

    useEffect(() => {
        requestNewScenario(); // Fetch the first scenario when the game starts
    }, []);

    const requestNewScenario = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/generate-scenario');
            setScenario(response.data.scenario);
            setChoices(response.data.choices);
        } catch (error) {
            console.error('Error fetching scenario:', error);
            setFeedback("Error fetching scenario. Please try again.");
        }
    };

    const handleChoice = async (choice: 'A' | 'B') => {
        // Simulate outcome based on choice
        const isCorrect = Math.random() > 0.5; // Randomly determine if the choice is correct
        if (isCorrect) {
            setScore(prev => prev + 1);
            setFeedback("Good choice! Moving forward.");
        } else {
            setFeedback("Oops! That choice set you back.");
            setTimer(prev => Math.max(prev - 10, 0)); // Deduct 10 seconds
        }

        // Request a new scenario after making a choice
        requestNewScenario();
    };

    if (gameOver) {
        return (
            <div>
                <h2>Game Over! Your score: {score}</h2>
                <button onClick={() => {
                    setGameOver(false);
                    setScore(0);
                    setTimer(60);
                    requestNewScenario();
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