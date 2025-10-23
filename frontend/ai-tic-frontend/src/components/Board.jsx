import React, { useState } from "react";
import axios from "axios";
import useSound from "use-sound";
import clickSound from "../assets/sounds/click.wav";
import winSound from "../assets/sounds/win.wav";
import loseSound from "../assets/sounds/lose.wav";
import alertSound from "../assets/sounds/alert.wav";

const Board = () => {
  const [board, setBoard] = useState(Array(9).fill(""));
  const [winner, setWinner] = useState(null);
  const [scores, setScores] = useState({ X: 0, O: 0, draw: 0 });
  const [playerSymbol, setPlayerSymbol] = useState(null);
  const [difficulty, setDifficulty] = useState("hard");
  const [gameStarted, setGameStarted] = useState(false);
  const [movesCount, setMovesCount] = useState(0);
  const [startTime, setStartTime] = useState(null);

  // Hint states
  const [hintIndex, setHintIndex] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [remainingHints, setRemainingHints] = useState(3);

  // Voice Command
  const [listening, setListening] = useState(false);

  // Match Summary Modal
  const [showModal, setShowModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [gameSummary, setGameSummary] = useState({
    moves: 0,
    duration: 0,
    winner: null,
  });

  // ===== Sounds =====
  const [playClick] = useSound(clickSound, { volume: 0.5 });
  const [playWin] = useSound(winSound, { volume: 0.7 });
  const [playLose] = useSound(loseSound, { volume: 0.7 });
  const [playAlert] = useSound(alertSound, { volume: 0.6 });

  // Sound toggle
  const [soundOn, setSoundOn] = useState(true);
  const toggleSound = () => setSoundOn(!soundOn);

  // Start Game
  const startGame = (symbol, diff) => {
    setPlayerSymbol(symbol);
    setDifficulty(diff);
    setGameStarted(true);
    setMovesCount(0);
    setStartTime(Date.now());
  };

  // Handle click
  const handleClick = async (index) => {
    if (board[index] !== "" || winner) {
      if (soundOn) playAlert();
      return;
    }
    if (soundOn) playClick();

    const newBoard = [...board];
    newBoard[index] = playerSymbol;
    setBoard(newBoard);
    setMovesCount((prev) => prev + 1);

    try {
      const token = localStorage.getItem("access");
      if (!token) throw new Error("Unauthorized");

      const res = await axios.post(
        "http://127.0.0.1:8000/api/ai-move/",
        { board: newBoard, player_symbol: playerSymbol, difficulty },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBoard(res.data.board);
      setWinner(res.data.winner);
      if (res.data.scores) setScores(res.data.scores);

      if (res.data.winner) {
        const duration = (Date.now() - startTime) / 1000;
        let result = "Loss";

        if (res.data.winner === playerSymbol) {
          result = "Win";
          if (soundOn) playWin();
        } else if (res.data.winner === "draw") {
          result = "Draw";
          if (soundOn) playAlert();
        } else {
          if (soundOn) playLose();
        }

        setGameSummary({ moves: movesCount + 1, duration, winner: result });
        setShowModal(true);
        setModalVisible(true);

        try {
          await axios.post(
            "http://127.0.0.1:8000/api/game/save/",
            {
              result,
              player_symbol: playerSymbol,
              ai_symbol: playerSymbol === "X" ? "O" : "X",
              moves_count: movesCount + 1,
              duration,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (err) {
          console.error("Failed to save game:", err.response?.data || err.message);
        } finally {
          setTimeout(() => {
            setBoard(Array(9).fill(""));
            setWinner(null);
            setGameStarted(false);
            setMovesCount(0);
            setStartTime(null);
            setRemainingHints(3);
          }, 1500);
        }
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      setTimeout(() => {
        setBoard(Array(9).fill(""));
        setWinner(null);
        setGameStarted(false);
        setMovesCount(0);
        setStartTime(null);
        setRemainingHints(3);
      }, 1500);
    }
  };

  // ===== Get Hint using dedicated hint_move API =====
  const getHint = async () => {
    try {
      const token = localStorage.getItem("access");
      if (!token) throw new Error("Unauthorized");

      const res = await axios.post(
        "http://127.0.0.1:8000/api/hint_move/",
        { board, player_symbol: playerSymbol },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.error) {
        alert(res.data.error);
        if (soundOn) playAlert();
        setRemainingHints(0);
        return;
      }

      const suggestedMove = res.data.hint_move;
      if (suggestedMove !== null && suggestedMove !== undefined) {
        setHintIndex(suggestedMove);
        setShowHint(true);
        if (soundOn) playAlert();

        setRemainingHints(res.data.remaining);

        setTimeout(() => {
          setShowHint(false);
          setHintIndex(null);
        }, 1500);
      }
    } catch (err) {
      console.error("Hint error:", err.response?.data || err.message);
      alert("Failed to get hint. Try again later.");
      if (soundOn) playAlert();
    }
  };

  // ===== Voice Command =====
  const voiceMap = {
    "top left": 0,
    "top center": 1,
    "top right": 2,
    "middle left": 3,
    "center": 4,
    "middle": 4,
    "middle right": 5,
    "bottom left": 6,
    "bottom center": 7,
    "bottom right": 8
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert("Your browser does not support voice commands.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      const index = voiceMap[transcript];
      if (index !== undefined) {
        handleClick(index);
        speak(`Move played at ${transcript}`);
      } else {
        if (soundOn) playAlert();
        speak("Sorry, I didn't understand that move.");
      }
    };

    recognition.onend = () => setListening(false);

    recognition.start();
    setListening(true);
  };

  // Reset Board
  const resetBoard = () => {
    setBoard(Array(9).fill(""));
    setWinner(null);
    setPlayerSymbol(null);
    setGameStarted(false);
    setDifficulty("hard");
    setMovesCount(0);
    setStartTime(null);
    setRemainingHints(3);
  };

  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => setShowModal(false), 200);
  };

  // ===== JSX =====
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-200">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Tic Tac Toe</h1>
            <p className="text-gray-600 text-lg">Choose your symbol and difficulty to begin</p>
          </div>

          {/* Symbol Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-5 text-center">Choose Your Symbol</h2>
            <div className="flex gap-5 justify-center">
              <button
                onClick={() => startGame("X", difficulty)}
                className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-4xl font-bold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-110 transition-all duration-300 border-2 border-blue-400 hover:border-blue-300"
              >
                X
              </button>
              <button
                onClick={() => startGame("O", difficulty)}
                className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 text-white text-4xl font-bold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-110 transition-all duration-300 border-2 border-red-400 hover:border-red-300"
              >
                O
              </button>
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-5 text-center">Select Difficulty</h2>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setDifficulty("easy")}
                className={`px-4 py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 border-2 ${
                  difficulty === "easy" 
                    ? "bg-green-500 text-white border-green-400 shadow-green-200 hover:shadow-green-300" 
                    : "bg-green-100 text-green-700 border-green-200 hover:bg-green-200 hover:border-green-300"
                }`}
              >
                Easy
              </button>
              <button
                onClick={() => setDifficulty("medium")}
                className={`px-4 py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 border-2 ${
                  difficulty === "medium" 
                    ? "bg-yellow-500 text-white border-yellow-400 shadow-yellow-200 hover:shadow-yellow-300" 
                    : "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200 hover:border-yellow-300"
                }`}
              >
                Medium
              </button>
              <button
                onClick={() => setDifficulty("hard")}
                className={`px-4 py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 border-2 ${
                  difficulty === "hard" 
                    ? "bg-red-500 text-white border-red-400 shadow-red-200 hover:shadow-red-300" 
                    : "bg-red-100 text-red-700 border-red-200 hover:bg-red-200 hover:border-red-300"
                }`}
              >
                Hard
              </button>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-lg font-medium text-gray-700">
              Current: <span className="font-bold capitalize text-gray-900">{difficulty}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">Tic Tac Toe</h1>
          <div className="flex justify-center items-center gap-4 mb-6">
            <button
              onClick={toggleSound}
              className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 border-2 ${
                soundOn 
                  ? "bg-green-500 text-white border-green-400 hover:bg-green-600 hover:shadow-green-300" 
                  : "bg-gray-500 text-white border-gray-400 hover:bg-gray-600 hover:shadow-gray-300"
              }`}
            >
              {soundOn ? "🔊 Sound ON" : "🔇 Sound OFF"}
            </button>
          </div>
          
          {winner && (
            <div className="bg-gray-800 rounded-2xl p-6 inline-block border-2 border-gray-700 shadow-2xl">
              <h2 className="text-3xl font-bold text-white animate-pulse">
                {winner === "draw" ? "Game Draw! 🤝" : `${winner} Won! 🎉`}
              </h2>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Game Board */}
          <div className="xl:col-span-2 flex flex-col items-center">
            <div className="bg-gray-800 rounded-3xl p-8 shadow-2xl border-2 border-gray-700">
              <div className="grid grid-cols-3 gap-4">
                {board.map((cell, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleClick(idx)}
                    className={`w-24 h-24 md:w-28 md:h-28 text-4xl md:text-5xl font-bold rounded-xl border-3 transition-all duration-300 transform hover:scale-105 shadow-lg
                      ${showHint && hintIndex === idx 
                        ? "bg-yellow-500 text-yellow-900 border-yellow-400 animate-pulse shadow-2xl" 
                        : "bg-gray-700 text-white border-gray-600 hover:bg-gray-600 hover:border-gray-500 hover:shadow-xl"
                      }
                      ${cell === "X" ? "text-blue-400 border-blue-500" : ""}
                      ${cell === "O" ? "text-red-400 border-red-500" : ""}
                    `}
                  >
                    {cell}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Scores */}
            <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl border-2 border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-5 text-center border-b-2 border-gray-700 pb-3">Scores</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-xl hover:bg-gray-600 transition-all duration-300">
                  <span className="text-blue-300 font-semibold text-lg">You ({playerSymbol})</span>
                  <span className="text-white font-bold text-xl bg-gray-600 px-4 py-2 rounded-lg">{scores[playerSymbol]}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-xl hover:bg-gray-600 transition-all duration-300">
                  <span className="text-red-300 font-semibold text-lg">AI ({playerSymbol === "X" ? "O" : "X"})</span>
                  <span className="text-white font-bold text-xl bg-gray-600 px-4 py-2 rounded-lg">{scores[playerSymbol === "X" ? "O" : "X"]}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-xl hover:bg-gray-600 transition-all duration-300">
                  <span className="text-gray-300 font-semibold text-lg">Draws</span>
                  <span className="text-white font-bold text-xl bg-gray-600 px-4 py-2 rounded-lg">{scores.draw}</span>
                </div>
              </div>
            </div>

            {/* Game Info */}
            <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl border-2 border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-5 text-center border-b-2 border-gray-700 pb-3">Game Info</h3>
              <div className="space-y-4 text-center">
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-xl hover:bg-gray-600 transition-all duration-300">
                  <span className="text-gray-300 font-semibold">Difficulty:</span>
                  <span className="text-white font-bold capitalize">{difficulty}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-xl hover:bg-gray-600 transition-all duration-300">
                  <span className="text-gray-300 font-semibold">Moves:</span>
                  <span className="text-white font-bold">{movesCount}</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl border-2 border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-5 text-center border-b-2 border-gray-700 pb-3">Controls</h3>
              <div className="space-y-4">
                <button
                  onClick={resetBoard}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-blue-400 hover:border-blue-300 text-lg"
                >
                  🔄 Reset Game
                </button>

                <button
                  onClick={getHint}
                  disabled={remainingHints <= 0}
                  className={`w-full px-6 py-4 rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 border-2 text-lg ${
                    remainingHints <= 0
                      ? "bg-gray-600 text-gray-400 border-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-400 hover:border-purple-300 hover:shadow-purple-300"
                  }`}
                >
                  💡 Get Hint ({remainingHints} left)
                </button>

                <button
                  onClick={startListening}
                  className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-indigo-400 hover:border-indigo-300 text-lg"
                >
                  {listening ? "🎤 Listening..." : "🎤 Voice Move"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Match Summary Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full transform transition-all duration-300 border-2 border-gray-200
                        ${modalVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
          >
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Match Summary</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center p-4 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300">
                <span className="text-gray-700 font-semibold text-lg">Result</span>
                <span className={`text-xl font-bold ${
                  gameSummary.winner === "Win" ? "text-green-600" : 
                  gameSummary.winner === "Loss" ? "text-red-600" : "text-yellow-600"
                }`}>
                  {gameSummary.winner}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300">
                <span className="text-gray-700 font-semibold text-lg">Total Moves</span>
                <span className="text-xl font-bold text-gray-900">{gameSummary.moves}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300">
                <span className="text-gray-700 font-semibold text-lg">Duration</span>
                <span className="text-xl font-bold text-gray-900">{gameSummary.duration.toFixed(2)} sec</span>
              </div>
            </div>
            
            <button
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-blue-400 hover:border-blue-300 text-lg"
              onClick={closeModal}
            >
              Close Summary
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Board;