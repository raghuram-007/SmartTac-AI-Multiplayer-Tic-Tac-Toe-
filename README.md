
# 🤖 SmartTac: AI & Multiplayer Tic Tac Toe

**SmartTac** is an advanced **AI & Multiplayer Tic Tac Toe** web application.  
Players can challenge an **AI bot (Minimax or Q-Learning)** or play with **friends in real-time** using WebSockets.  
The system includes authentication, leaderboard tracking, and adaptive AI that learns from player moves.

## Features


### 🎮 Gameplay
- **Single-player mode** (vs AI using Minimax or Q-Learning)
- **Multiplayer mode** via **WebSockets**
- **Difficulty levels:** Easy / Medium / Hard
- **Real-time chat system**

### 🧠 AI & Learning
- **Minimax Algorithm** for optimal moves
- **Q-Learning** reinforcement model that improves over time
- Adjustable **epsilon-greedy strategy** for exploration/exploitation

### 👤 User System
- **JWT Authentication**
- **Profile stats:** wins, losses, draws
- **Leaderboard** with top player rankings

### ⚙️ Backend
- **Django + Channels** for real-time multiplayer
- **FastAPI** for AI and Q-learning API logic
- **PostgreSQL/MySQL** as database

### 💻 Frontend
- **React.js (Vite)** for a responsive, modern UI
- **Socket.IO client** for multiplayer
- **Sound effects & animations** for better UX## Author

👤 **Author:** Raghu Ram  
🌐 **GitHub:** [raghuram-007](https://github.com/raghuram-007)  



![Author](https://img.shields.io/badge/Author-Raghu%20Ram-blue?style=for-the-badge)
![GitHub](https://img.shields.io/badge/GitHub-raghuram--007-black?style=for-the-badge&logo=github&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwindcss](https://img.shields.io/badge/Tailwindcss-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![WebSockets](https://img.shields.io/badge/WebSockets-4A90E2?style=for-the-badge&logo=websocket&logoColor=white)
![Machine Learning](https://img.shields.io/badge/Reinforcement_Learning-Q_Learning-orange?style=for-the-badge)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)
## Tech Stack


| Layer | Technology |
|-------|-------------|
| **Frontend** | React (Vite), Socket.IO, TailwindCSS |
| **Backend (Game & Auth)** | Django, Django Channels |
| **Backend (AI)** | FastAPI, Q-Learning |
| **Database** | PostgreSQL / MySQL |
| **Authentication** | JWT |
| **Version Control** | Git + GitHub |
 ⚙️ Setup Instructions

### 🧩 1. Clone the repository




```bash
git clone https://github.com/raghuram-007/SmartTac.git
cd SmartTac


Backend Setup (Django)

cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver


Frontend Setup (React)

cd frontend
npm install
npm run dev
