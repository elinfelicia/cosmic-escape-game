// src/components/Game.tsx
import React, { useEffect, useState } from 'react';
import io  from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:4000'); // Adjust the URL if your server is hosted elsewhere

const Game: React.FC = () => {
    const [question, setQuestion] = useState<string>('');
    const [answers, setAnswers] = useState<string[]>([]);
    const [timer, setTimer] = useState<number>(60); // 60 seconds timer
    const [score, setScore] = useState<number>(0);
    const [gameOver, setGameOver] = useState<boolean>(false);

    useEffect(() => {
        requestNewQuestion();

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
        };
    }, []);

    const requestNewQuestion = async () => {
        try {
            const response = await axios.get('/api/generate-question'); // Adjust this endpoint as needed
            const { question, answers } = response.data;
            setQuestion(question);
            setAnswers(answers);
        } catch (error) {
            console.error('Error fetching question:', error);
        }
    };

    const handleAnswer = (answer: string) => {
        // Logic to check if the answer is correct
        // For now, let's assume the first answer is always correct for demonstration
        if (answer === answers[0]) { // Replace with actual logic to check the answer
            setScore(prev => prev + 1);
            requestNewQuestion(); // Get a new question
        } else {
            setTimer(prev => Math.max(prev - 10, 0)); // Deduct 10 seconds
        }
    };

    if (gameOver) {
        return <h2>Game Over! Your score: {score}</h2>;
    }

    return (
        <div>
            <h1>Cosmic Escape</h1>
            <h2>Time Left: {timer}s</h2>
            <h2>Score: {score}</h2>
            <h3>{question}</h3>
            <div>
                {answers.map((answer, index) => (
                    <button key={index} onClick={() => handleAnswer(answer)}>
                        {answer}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Game;