import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const SymbolSelector = () => {
  const navigate = useNavigate();
  const { roomName } = useParams();
  const [symbol, setSymbol] = useState("");

  const handleSelect = (s) => {
    setSymbol(s);
    navigate(`/multiplayer/${s}/${roomName}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-200">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Choose Your Symbol
          </h1>
          <p className="text-gray-600 text-lg">
            Room: <span className="font-semibold text-gray-800">{roomName}</span>
          </p>
        </div>

        {/* Symbol Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            Select Your Warrior
          </h2>
          <div className="flex gap-6 justify-center">
            {/* X Symbol Button */}
            <button
              onClick={() => handleSelect("X")}
              className="w-28 h-28 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-5xl font-bold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-110 transition-all duration-300 border-2 border-blue-400 hover:border-blue-300 flex items-center justify-center"
            >
              X
            </button>

            {/* O Symbol Button */}
            <button
              onClick={() => handleSelect("O")}
              className="w-28 h-28 bg-gradient-to-br from-red-500 to-red-600 text-white text-5xl font-bold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-110 transition-all duration-300 border-2 border-red-400 hover:border-red-300 flex items-center justify-center"
            >
              O
            </button>
          </div>
        </div>

        {/* Visual Separator */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-red-500 rounded-full"></div>
        </div>

        {/* Instructions */}
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            Choose wisely! <span className="font-semibold text-gray-800">X</span> goes first in the game
          </p>
        </div>

        {/* Selected Symbol Indicator */}
        {symbol && (
          <div className="mt-6 p-4 bg-gray-100 rounded-xl border border-gray-300 text-center">
            <p className="text-gray-700 font-semibold">
              Selected: <span className="text-lg font-bold text-gray-900">{symbol}</span>
            </p>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-gray-400 hover:border-gray-300"
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default SymbolSelector;