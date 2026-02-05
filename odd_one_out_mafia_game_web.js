// =============================
// SIMPLE ONLINE "ODD ONE OUT / MAFIA" WEB GAME
// Tech: Node.js + Express + Socket.IO
// Works on: iOS, Android, Mac, Windows, Linux (any modern browser)
// Style: Neutral pastel, lightweight, low-lag
// =============================

/* -----------------------------
   HOW TO RUN (LOCAL / HOSTING)
   1. Install Node.js
   2. Create folder
   3. npm init -y
   4. npm install express socket.io
   5. Save this file as server.js
   6. node server.js
   7. Open http://localhost:3000 on phones
-------------------------------- */

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Odd One Out</title>
<script src="/socket.io/socket.io.js"></script>
<style>
body {
  font-family: system-ui, sans-serif;
  background: #f4f3f8;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.card {
  background: #ffffff;
  padding: 24px;
  border-radius: 18px;
  width: 320px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  text-align: center;
}
button {
  background: #c7d2fe;
  border: none;
  padding: 12px 18px;
  border-radius: 12px;
  font-size: 16px;
  cursor: pointer;
}
button:hover { background: #a5b4fc; }
.option {
  background: #e5e7eb;
  margin: 8px 0;
  padding: 10px;
  border-radius: 10px;
}
.timer { font-size: 20px; margin: 10px; }
</style>
</head>
<body>
<div class="card">
  <h2>Odd One Out</h2>
  <div id="screen"></div>
</div>

<script>
const socket = io();
let myId;

socket.on('connect', () => myId = socket.id);

socket.on('assignWord', data => {
  document.getElementById('screen').innerHTML = `
    <p>Your word:</p>
    <h3>${data.word}</h3>
    <p>Answer options when prompted</p>
  `;
});

socket.on('showOptions', options => {
  document.getElementById('screen').innerHTML = '<h3>Choose</h3>';
  options.forEach(o => {
    const div = document.createElement('div');
    div.className = 'option';
    div.innerText = o;
    div.onclick = () => socket.emit('answer', o);
    document.getElementById('screen').appendChild(div);
  });
});

socket.on('voting', players => {
  document.getElementById('screen').innerHTML = '<h3>Who is the mafia?</h3>';
  players.forEach(p => {
    const btn = document.createElement('button');
    btn.innerText = p;
    btn.onclick = () => socket.emit('vote', p);
    document.getElementById('screen').appendChild(btn);
  });
});

socket.on('result', msg => {
  document.getElementById('screen').innerHTML = `<h3>${msg}</h3>`;
});
</script>
</body>
</html>
  `);
});

let players = {};
let mafia = null;

const words = ['Apple', 'Banana', 'Orange', 'Grape'];
const oddWord = 'Car';

io.on('connection', socket => {
  players[socket.id] = { score: 0 };

  if (Object.keys(players).length >= 4 && !mafia) startGame();

  socket.on('answer', () => {});

  socket.on('vote', voted => {
    if (voted === mafia) {
      socket.emit('result', 'Correct! You found the mafia 👀');
    } else {
      socket.emit('result', 'Wrong! Mafia escaped 😈');
    }
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
  });
});

function startGame() {
  const ids = Object.keys(players);
  mafia = ids[Math.floor(Math.random() * ids.length)];

  ids.forEach(id => {
    const word = id === mafia ? oddWord : words[0];
    io.to(id).emit('assignWord', { word });
  });

  setTimeout(() => {
    io.emit('showOptions', ['Option A', 'Option B', 'Option C']);
  }, 3000);

  setTimeout(() => {
    io.emit('voting', ids);
  }, 60000);
}

http.listen(3000, () => console.log('Game running on port 3000'));
