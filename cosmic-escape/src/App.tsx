   // src/App.tsx
   import React, { useState } from 'react';
   import Game from './components/Game';
   import LandingPage from './components/LandingPage';

   const App: React.FC = () => {
       const [isGameStarted, setIsGameStarted] = useState<boolean>(false);

       return (
           <div>
               {isGameStarted ? (
                   <Game />
               ) : (
                   <LandingPage onStart={() => setIsGameStarted(true)} />
               )}
           </div>
       );
   };

   export default App;