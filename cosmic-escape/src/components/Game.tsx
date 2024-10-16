import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const Game: React.FC = () => {
    const [scenario, setScenario] = useState<string>('');
    const [displayedScenario, setDisplayedScenario] = useState<string>(''); // For displaying the scenario
    const [choices, setChoices] = useState<{ A: string; B: string }>({ A: '', B: '' });
    const [score, setScore] = useState<number>(0);
    const [timer, setTimer] = useState<number>(180); // Start at 3 minutes (180 seconds)
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [feedback, setFeedback] = useState<string>('');
    const [scenarios, setScenarios] = useState<any[]>([]); // Keep using any
    const [currentScenarioIndex, setCurrentScenarioIndex] = useState<number>(0); // Track current scenario index
    const [loading, setLoading] = useState<boolean>(false); // State to track loading
    const timerRef = useRef<NodeJS.Timeout | null>(null); // Ref to store the timer

    useEffect(() => {
        startGame(); // Start the game when the component mounts
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current); // Clear the interval on unmount
            }
        };
    }, []);

    const startGame = async () => {
        setLoading(true); // Set loading to true
        try {
            const response = await axios.post('http://localhost:4000/api/start-game'); // Start the game and generate scenarios
            setScenarios(response.data.scenarios); // Set the scenarios state
            requestNewScenario(); // Fetch the first scenario after starting the game
        } catch (error) {
            console.error('Error starting game:', error);
            setFeedback("Error starting game. Please try again.");
        } finally {
            setLoading(false); // Set loading to false after fetching
        }
    };

    const requestNewScenario = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/current-scenario');
            setScenario(response.data.scenario); // Set the full scenario text
            setChoices(response.data.choices); // Set the choices
            setDisplayedScenario(response.data.scenario); // Directly set the displayed scenario
        } catch (error) {
            console.error('Error fetching scenario:', error);
            setFeedback("Error fetching scenario. Please try again.");
        }
    };

    const handleChoice = async (choice: 'A' | 'B') => {
        const correctAnswer = scenarios[currentScenarioIndex]?.correctAnswer; // Access the correct answer safely

        if (choice === correctAnswer) { // Check if the player's choice matches the correct answer
            setScore(prev => prev + 1);
            setFeedback("Correct!");
        } else {
            setFeedback("Incorrect!");
            setTimer(prev => Math.max(prev - 10, 0)); // Deduct 10 seconds
        }

        // Check for winning condition
        if (score + 1 >= 10) {
            setGameOver(true);
            setFeedback("Congratulations! You’ve successfully escaped the ship!");
            return;
        }

        // Immediately fetch the next scenario after making a choice
        await axios.post('http://localhost:4000/api/next-scenario');
        setCurrentScenarioIndex(prev => prev + 1); // Increment the current scenario index
        requestNewScenario(); // Fetch the next scenario
    };

    const handleRestart = async () => {
        setFeedback(''); // Clear feedback message
        setGameOver(false);
        setScore(0);
        setTimer(180); // Reset timer to 3 minutes
        setCurrentScenarioIndex(0); // Reset scenario index
        await startGame(); // Restart the game and generate new scenarios
    };

    if (loading) {
        return (
            <div className='loading-screen'>
                <span role="img" aria-label="robot" className="loading-emoji">🤖</span>
            </div>
        );
    }

    if (gameOver) {
        return (
            <div className='game-over'>
                <h2>{feedback}</h2>
                <button onClick={handleRestart}>Restart Game</button> {/* Call handleRestart on click */}
            </div>
        );
    }

    return (
        <div className='game-container'>
            <h1>Cosmic Escape</h1>
            <h2>Time Left: {timer}s</h2>
            <h2>Score: {score}</h2>
            <h3>{displayedScenario}</h3> {/* Display the scenario directly */}
            {displayedScenario && ( // Only show choices after the scenario is fully displayed
                <div className='choices'>
                    <button onClick={() => handleChoice('A')}>{choices.A}</button>
                    <button onClick={() => handleChoice('B')}>{choices.B}</button>
                </div>
            )}
            {/* Invisible feedback element */}
            <p className='feedback invisible-feedback'>Feedback will appear here.</p> {/* Invisible feedback message */}
            <p className='feedback' style={{ visibility: feedback ? 'visible' : 'hidden' }}>{feedback}</p> {/* Display feedback message */}
        </div>
    );
};

export default Game;