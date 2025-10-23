import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";   // Import Navbar
import Board from "./components/Board";
import Register from "./components/Register";
import Login from "./components/Login";
import Stats from "./components/Stats";
import Profile from "./components/Profile";
import { Toaster } from "react-hot-toast";
import MultiplayerBoardWrapper from "./components/MultiplayerBoardWrapper";

import GameMenu from "./components/GameMenu";
import SymbolSelector from "./components/SymbolSelectionPage";

function App() {
  return (
    <Router>
      <div className="App">
        {/* Navbar will be visible on all pages */}
        <Navbar />

        <div className="mt-4">
          <Routes>
              <Route path="/" element={<GameMenu />} />
            <Route path="/ai" element={<Board />} />       {/* Tic Tac Toe */}
            <Route path="/register" element={<Register />} />  {/* Register */}
            <Route path="/login" element={<Login />} />         {/* Login */}
            <Route path="/stats" element={<Stats />} />         {/* Stats */}
            <Route path="/profile" element={<Profile/>} />  
               <Route path="/multiplayer/:player/:roomName" element={<MultiplayerBoardWrapper />} /> 
               <Route path="/symbol-select/:roomName" element={<SymbolSelector/>}/>   
          </Routes>
           <Toaster 
        position="top-center" 
        reverseOrder={false} 
        toastOptions={{
          style: {
            border: '1px solid #3b82f6', // blue border
            padding: '12px 16px',
            color: '#1f2937', // dark text
            borderRadius: '12px',
            background: '#f9fafb', // light bg
          },
          success: {
            iconTheme: {
              primary: '#22c55e', // green
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444', // red
              secondary: 'white',
            },
          },
        }}
      />
        </div>
      </div>
    </Router>
  );
}

export default App;
