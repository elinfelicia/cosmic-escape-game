   // src/components/LandingPage.tsx
   import React from 'react';

   const LandingPage: React.FC<{ onStart: () => void }> = ({ onStart }) => {
       return (
           <div className="welcome-msg">
               <h1>Welcome to Cosmic Escape!</h1>
               <p>
                   🤖 "Greetings, human! You've woken up trapped on a spaceship about to implode! 
                   You have to escape before the timer runs out. Answer my questions correctly to 
                   move closer to the exit. But be careful, an incorrect answer will cost you time! 
                   Now, are you ready to save your skin?" 
               </p>
               <button onClick={onStart}>Start Game</button>
           </div>
       );
   };

   export default LandingPage;