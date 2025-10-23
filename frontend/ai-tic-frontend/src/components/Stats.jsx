// src/components/Stats.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const Stats = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("access");
        const res = await axios.get("http://localhost:8000/api/user/stats/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStats(res.data);
      } catch (err) {
        setError("Failed to load stats.");
        console.error(err);
      }
    };

    fetchStats();
  }, []);

  if (error) return (
    <div className="flex justify-center items-center min-h-64">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md w-full">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-red-500 text-xl">⚠️</span>
        </div>
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    </div>
  );

  if (!stats) return (
    <div className="flex justify-center items-center min-h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-3"></div>
        <p className="text-gray-600 font-medium">Loading stats...</p>
      </div>
    </div>
  );

  // Chart data
  const chartData = [
    { name: "Wins", value: stats.wins, color: "#10B981", gradient: "from-green-500 to-emerald-600" },
    { name: "Losses", value: stats.losses, color: "#EF4444", gradient: "from-red-500 to-rose-600" },
    { name: "Draws", value: stats.draws, color: "#6B7280", gradient: "from-gray-500 to-slate-600" },
  ];

  // Stats cards data
  const statCards = [
    { label: "Total Games", value: stats.total_games, icon: "🎮", color: "bg-blue-500" },
    { label: "Win Rate", value: `${stats.win_rate}%`, icon: "📈", color: "bg-green-500" },
    { label: "Avg Moves", value: stats.avg_moves, icon: "♟️", color: "bg-purple-500" },
    { label: "Avg Duration", value: `${stats.avg_duration}s`, icon: "⏱️", color: "bg-orange-500" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Game Statistics</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Track your performance and improve your gameplay with detailed analytics
        </p>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center text-white text-xl`}>
                {card.icon}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{card.value}</h3>
            <p className="text-gray-600 font-medium">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Detailed Stats List */}
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
            Detailed Breakdown
          </h3>
          <div className="space-y-4">
            {[
              { label: "Total Games Played", value: stats.total_games, bg: "bg-blue-50" },
              { label: "Games Won", value: stats.wins, bg: "bg-green-50" },
              { label: "Games Lost", value: stats.losses, bg: "bg-red-50" },
              { label: "Games Drawn", value: stats.draws, bg: "bg-gray-50" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              >
                <span className="text-gray-700 font-medium">{item.label}</span>
                <span className="text-lg font-bold text-gray-900 bg-white px-3 py-1 rounded-lg shadow-sm">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
            Performance Overview
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#F3F4F6" 
                  vertical={false}
                />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 14 }}
                />
                <YAxis 
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  }}
                  cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }}
                />
                <Legend 
                  verticalAlign="top"
                  height={36}
                  iconType="circle"
                  iconSize={10}
                />
                <Bar 
                  dataKey="value" 
                  radius={[8, 8, 0, 0]}
                  barSize={60}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      className="hover:opacity-80 transition-opacity duration-200"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend with improved styling */}
          <div className="flex justify-center gap-6 mt-6">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600 font-medium">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Win Rate Progress Bar */}
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 mt-8 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Win Rate Progress</h3>
          <span className="text-2xl font-bold text-green-600">{stats.win_rate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-gradient-to-r from-green-500 to-emerald-600 h-4 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${Math.min(stats.win_rate, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

export default Stats;