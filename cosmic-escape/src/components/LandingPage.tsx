   // src/components/LandingPage.tsx
   import React from 'react';

   const LandingPage: React.FC<{ onStart: () => void }> = ({ onStart }) => {
       return (
           <div className="welcome-msg">
               <h1>Welcome to Cosmic Escape!</h1>
               <h2>🤖 Greetings, human! </h2>
               <p>You have woken up trapped on a spaceship about to implode! 
                   You have to escape before the timer runs out. There will be dangers along the way, and it is up to you to decide your fate. 
                   A correct choice in each scenario will move you closer to the exit. But be careful, an incorrect answer will cost you time! 
                   
                </p>
                <p>Now, are you ready to attempt an escape? </p>
               <button onClick={onStart}>Start Game</button>
           </div>
       );
   };

   export default LandingPage;