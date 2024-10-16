import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const Game: React.FC = () => {
    const [scenario, setScenario] = useState<string>('');
    const [displayedScenario, setDisplayedScenario] = useState<string>(''); // For displaying the scenario
    const [choices, setChoices] = useState<{ A: string; B: string }>({ A: '', B: '' });
    const [score, setScore] = useState<number>(0);
    const [timer, setTimer] = useState<number>(150); // Start at 150 seconds
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [feedback, setFeedback] = useState<string>('');
    const [scenarios, setScenarios] = useState<any[]>([]); // Keep using any
    const [currentScenarioIndex, setCurrentScenarioIndex] = useState<number>(0); // Track current scenario index
    const [loading, setLoading] = useState<boolean>(false); // State to track loading
    const timerRef = useRef<NodeJS.Timeout | null>(null); // Ref to store the timer
    const hasStarted = useRef<boolean>(false); // Flag to check if the game has started

    useEffect(() => {
        if (!hasStarted.current) {
            startGame(); // Start the game when the component mounts
            hasStarted.current = true; // Set the flag to true after starting the game
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current); // Clear the interval on unmount
            }
        };
    }, []);

    const startGame = async () => {
        setLoading(true); // Set loading to true
        setTimer(150); // Reset timer to 150 seconds
        setScore(0); // Reset score
        setCurrentScenarioIndex(0); // Reset scenario index
        setGameOver(false); // Reset game over state
        setFeedback(''); // Clear feedback message

        // Clear any existing timer before starting a new one
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        try {
            const response = await axios.post('http://localhost:4000/api/start-game'); // Start the game and generate scenarios
            setScenarios(response.data.scenarios); // Set the scenarios state
            requestNewScenario(); // Fetch the first scenario after starting the game

            // Start the timer countdown
            timerRef.current = setInterval(() => {
                setTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!);
                        setGameOver(true);
                        setFeedback("Time's up! You didn't make it to the exit. The ship has imploded, and well... You are dead :)");
                        return 0;
                    }
                    return prev - 1; // Decrease timer every second
                });
            }, 1000); // 1000 ms = 1 second
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
            setFeedback("Good choice, you have moved closer to the exit!!");
        } else {
            setFeedback("Uh oh, that was a baaaad choice and has cost you precious time!");
            setTimer(prev => Math.max(prev - 10, 0)); // Deduct 10 seconds for incorrect choice
        }

        // Check for winning condition
        if (score + 1 >= 10) {
            setGameOver(true);
            setFeedback("Congratulations! You have successfully exited the ship! You are now aimlessly floating around in an escape pod, yay! :)");
            return;
        }

        // Immediately fetch the next scenario after making a choice
        await axios.post('http://localhost:4000/api/next-scenario');
        setCurrentScenarioIndex(prev => prev + 1); // Increment the current scenario index
        requestNewScenario(); // Fetch the next scenario
    };

    const handleRestart = async () => {
        // Clear the existing timer before restarting the game
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
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
            <h2>Progress: {score}</h2>
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