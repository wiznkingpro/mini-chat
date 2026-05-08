import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = 3001;
const messages = [];
let users = new Map();

io.on('connection', (socket) => {
  console.log('Пользователь подключился:', socket.id);
  
  socket.emit('message history', messages.slice(-50));
  
  socket.on('user join', (username) => {
    users.set(socket.id, username);
    io.emit('user list', Array.from(users.values()));
    io.emit('system message', {
      id: Date.now(),
      text: `${username} присоединился к чату`,
      time: new Date().toLocaleTimeString()
    });
    console.log(`${username} вошёл в чат`);
  });
  
  socket.on('chat message', (data) => {
    const msg = {
      id: Date.now(),
      username: users.get(socket.id) || 'Аноним',
      text: data.text,
      time: new Date().toLocaleTimeString()
    };
    messages.push(msg);
    io.emit('chat message', msg);
  });
  
  socket.on('typing', (isTyping) => {
    const username = users.get(socket.id);
    if (username) {
      socket.broadcast.emit('user typing', { username, isTyping });
    }
  });
  
  socket.on('disconnect', () => {
    const username = users.get(socket.id);
    users.delete(socket.id);
    if (username) {
      io.emit('user list', Array.from(users.values()));
      io.emit('system message', {
        id: Date.now(),
        text: `${username} покинул чат`,
        time: new Date().toLocaleTimeString()
      });
      console.log(`${username} вышел из чата`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
});