// src/components/Game.tsx
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:4000'); // Adjust the URL if your server is hosted elsewhere

const Game: React.FC = () => {
    const [question, setQuestion] = useState<string>('');
    const [answers, setAnswers] = useState<string[]>([]);
    const [timer, setTimer] = useState<number>(180); // 60 seconds timer
    const [score, setScore] = useState<number>(0);
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [correctAnswer, setCorrectAnswer] = useState<string>('');
    const [feedback, setFeedback] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false); // New loading state
    const [canFetchNewQuestion, setCanFetchNewQuestion] = useState<boolean>(true); // Control fetching new questions
    const [currentQuestion, setCurrentQuestion] = useState<string>(''); // State to hold the current question

    useEffect(() => {
        console.log('Component mounted, requesting new question...');
        requestNewQuestion(); // Call this only once when the component mounts

        socket.on('gameOver', () => {
            setGameOver(true);
            alert('Game Over received from server.');
        });

        const countdown = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(countdown);
                    setGameOver(true);
                    alert('Time is up! The spaceship has imploded. Game Over.');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(countdown);
            socket.off('gameOver'); // Clean up the socket listener
        };
    }, []); // Empty dependency array to run only once

    const requestNewQuestion = async () => {
        if (loading || !canFetchNewQuestion) return; // Prevent multiple calls if already loading or if fetching is not allowed
        setLoading(true); // Set loading to true
        console.log('Requesting new question...'); // Log when requesting a new question
        try {
            const response = await axios.get('http://localhost:4000/api/generate-question'); // Ensure the full URL is correct
            console.log('API Response:', response.data); // Log the response
            const { question, answers } = response.data;

            // Check if the new question is the same as the previous one
            if (question === currentQuestion) {
                console.warn('Received the same question again, requesting a new one...');
                return requestNewQuestion(); // Fetch a new question if it's the same
            }

            setQuestion(question);
            setAnswers(answers);
            setCurrentQuestion(question); // Store the current question

            // Set the correct answer based on the AI's output
            const correctAnswerIndex = answers.findIndex(answer => answer.includes("Mars")); // Adjust this logic based on the AI's output
            if (correctAnswerIndex !== -1) {
                setCorrectAnswer(answers[correctAnswerIndex]); // Set the correct answer dynamically
            } else {
                setCorrectAnswer(answers[0]); // Fallback to the first answer if not found
            }

        } catch (error) {
            console.error('Error fetching question:', error);
            setFeedback("Error fetching question. Please try again.");
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    const handleAnswer = (answer: string) => {
        if (loading) return; // Prevent answering while loading
        if (answer === correctAnswer) {
            setScore(prev => prev + 1);
            setFeedback("Correct!");
            setCanFetchNewQuestion(true); // Allow fetching a new question
            requestNewQuestion(); // Get a new question
        } else {
            setTimer(prev => Math.max(prev - 10, 0)); // Deduct 10 seconds
            setFeedback("Incorrect! The correct answer was " + correctAnswer);
            setCanFetchNewQuestion(false); // Prevent fetching a new question until the player answers
        }
    };

    if (gameOver) {
        return (
            <div>
                <h2>Game Over! Your score: {score}</h2>
                <button onClick={() => {
                    setGameOver(false);
                    setScore(0);
                    setTimer(60);
                    requestNewQuestion();
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
            <h3>{question}</h3>
            <div>
                {Array.isArray(answers) && answers.length > 0 ? (
                    answers.map((answer, index) => (
                        <button key={index} onClick={() => handleAnswer(answer)}>
                            {answer}
                        </button>
                    ))
                ) : (
                    <p>Bot is thinking...</p> // Fallback UI while loading
                )}
            </div>
            {feedback && <p>{feedback}</p>} {/* Display feedback message */}
        </div>
    );
};

export default Game;