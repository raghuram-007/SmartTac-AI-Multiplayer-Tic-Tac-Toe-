import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const MultiplayerBoard = ({ roomName, initialSymbol }) => {
  const [board, setBoard] = useState(Array(9).fill(""));
  const [ws, setWs] = useState(null);
  const [winner, setWinner] = useState(null);
  const [turn, setTurn] = useState("X");
  const [connected, setConnected] = useState(false);
  const [opponentJoined, setOpponentJoined] = useState(false);
  const [playerSymbol, setPlayerSymbol] = useState(initialSymbol);
  const [opponentAction, setOpponentAction] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const socket = new WebSocket(
      `ws://127.0.0.1:8000/ws/game/${roomName}/${
        playerSymbol ? "?player_symbol=" + playerSymbol : ""
      }`
    );

    socket.onopen = () => setConnected(true);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "update_board") {
        setBoard(data.board);
        setTurn(data.player === "X" ? "O" : "X");
      } else if (data.type === "game_over") {
        setBoard(data.board);
        setWinner(data.winner);
      } else if (data.type === "connected") {
        setPlayerSymbol(data.player_symbol);
        setOpponentJoined(data.opponentJoined);
      } else if (data.type === "player_continue") {
        setOpponentAction(`${data.player} wants to continue`);
      } else if (data.type === "player_exit") {
        setOpponentAction(`${data.player} exited the game`);
      } else if (data.type === "chat") {
        setChatMessages((prev) => [...prev, data.message]);
        scrollToBottom();
      }
    };

    socket.onclose = () => setConnected(false);
    setWs(socket);

    return () => socket.close();
  }, [roomName]);

  const handleClick = (index) => {
    if (!connected) return alert("Not connected to server");
    if (!opponentJoined) return alert("Waiting for opponent...");
    if (board[index] !== "" || winner || turn !== playerSymbol) return;

    const newBoard = [...board];
    newBoard[index] = playerSymbol;
    setBoard(newBoard);
    setTurn(playerSymbol === "X" ? "O" : "X");

    ws?.send(JSON.stringify({ action: "move", move: index, player: playerSymbol, board: newBoard }));
  };

  const resetBoard = () => {
    setBoard(Array(9).fill(""));
    setWinner(null);
    setTurn("X");
    setOpponentAction(null);
  };

  const handleContinue = () => {
    ws?.send(JSON.stringify({ action: "continue", player: playerSymbol }));
    resetBoard();
  };

  const handleExit = () => {
    ws?.send(JSON.stringify({ action: "exit", player: playerSymbol }));
    navigate("/");
  };

  const sendChat = () => {
    if (!chatInput.trim() || !ws) return;
    ws.send(JSON.stringify({ action: "chat", message: { player: playerSymbol, text: chatInput } }));
    setChatInput("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
            Multiplayer Tic Tac Toe
          </h1>
          
          {/* Game Status */}
          <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl border-2 border-gray-700 max-w-2xl mx-auto">
            {winner ? (
              <div className="text-center">
                <h2 className="text-3xl font-bold text-green-400 mb-3 animate-pulse">
                  🎉 {winner === "draw" ? "Game Draw!" : `Winner: ${winner}`} 🎉
                </h2>
              </div>
            ) : !opponentJoined ? (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-yellow-400 mb-3">
                  ⏳ Waiting for opponent...
                </h2>
                <p className="text-gray-300">Room: <span className="font-semibold text-white">{roomName}</span></p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-gray-700 rounded-xl p-4 border border-gray-600">
                  <p className="text-gray-300 text-sm">Your Symbol</p>
                  <p className="text-2xl font-bold text-blue-400">{playerSymbol}</p>
                </div>
                <div className="bg-gray-700 rounded-xl p-4 border border-gray-600">
                  <p className="text-gray-300 text-sm">Current Turn</p>
                  <p className={`text-2xl font-bold ${turn === "X" ? "text-blue-400" : "text-red-400"}`}>
                    {turn}
                  </p>
                </div>
                <div className="bg-gray-700 rounded-xl p-4 border border-gray-600">
                  <p className="text-gray-300 text-sm">Status</p>
                  <p className="text-lg font-bold text-green-400">Playing</p>
                </div>
              </div>
            )}
          </div>

          {opponentAction && (
            <div className="mt-4 bg-yellow-500/20 border border-yellow-500 rounded-xl p-3 max-w-md mx-auto">
              <p className="text-yellow-400 font-semibold text-center">{opponentAction}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Board */}
          <div className="lg:col-span-2 flex flex-col items-center">
            <div className="bg-gray-800 rounded-3xl p-8 shadow-2xl border-2 border-gray-700">
              <div className="grid grid-cols-3 gap-4">
                {board.map((cell, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleClick(idx)}
                    disabled={!connected || !opponentJoined || cell !== "" || winner || turn !== playerSymbol}
                    className={`w-20 h-20 md:w-24 md:h-24 text-4xl md:text-5xl font-bold rounded-xl border-3 transition-all duration-300 transform hover:scale-105 shadow-lg
                      ${!connected || !opponentJoined || cell !== "" || winner || turn !== playerSymbol 
                        ? "opacity-70 cursor-not-allowed" 
                        : "hover:shadow-xl cursor-pointer"
                      }
                      ${cell === "X" 
                        ? "text-blue-400 border-blue-500 bg-blue-500/10" 
                        : cell === "O" 
                        ? "text-red-400 border-red-500 bg-red-500/10" 
                        : "text-white border-gray-600 bg-gray-700 hover:bg-gray-600"
                      }
                      ${winner && cell === playerSymbol ? "bg-green-500/20 border-green-500" : ""}
                    `}
                  >
                    {cell}
                  </button>
                ))}
              </div>
            </div>

            {/* Game Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button 
                onClick={resetBoard}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-blue-400 hover:border-blue-300"
              >
                🔄 Reset Game
              </button>

              {winner && (
                <>
                  <button 
                    onClick={handleContinue}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-green-400 hover:border-green-300"
                  >
                    ✅ Continue
                  </button>
                  <button 
                    onClick={handleExit}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-red-400 hover:border-red-300"
                  >
                    🚪 Exit Game
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Chat Section */}
          <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl border-2 border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-5 text-center border-b-2 border-gray-700 pb-3">
              💬 Game Chat
            </h3>
            
            {/* Chat Messages */}
            <div className="h-64 mb-4 overflow-y-auto bg-gray-900 rounded-xl p-4 border border-gray-700">
              {chatMessages.length === 0 ? (
                <p className="text-gray-500 text-center italic py-8">
                  No messages yet. Start the conversation!
                </p>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`mb-3 p-3 rounded-xl border-2 ${
                      msg.player === playerSymbol 
                        ? "bg-blue-500/10 border-blue-500 ml-8" 
                        : "bg-gray-700 border-gray-600 mr-8"
                    }`}
                  >
                    <p className={`text-sm font-semibold ${
                      msg.player === playerSymbol ? "text-blue-400" : "text-red-400"
                    }`}>
                      {msg.player === playerSymbol ? "You" : `Opponent (${msg.player})`}
                    </p>
                    <p className="text-white mt-1">{msg.text}</p>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="flex gap-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                className="flex-1 bg-gray-700 border-2 border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all duration-300"
                placeholder="Type your message..."
                disabled={!connected}
              />
              <button 
                onClick={sendChat}
                disabled={!connected || !chatInput.trim()}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-indigo-400 hover:border-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        {!connected && (
          <div className="mt-6 bg-red-500/20 border border-red-500 rounded-xl p-4 max-w-md mx-auto text-center">
            <p className="text-red-400 font-semibold">
              🔌 Connecting to server...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiplayerBoard;