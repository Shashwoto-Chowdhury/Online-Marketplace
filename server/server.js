const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const conversationRouter = require('./router/user/conversations');
// … your existing imports …

const app = express();
app.use(express.json());

// mount conversations API
app.use('/users/conversations', conversationRouter);

// your existing routers…
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// keep io on app for use in routes if needed
app.set('io', io);

io.on('connection', socket => {
  socket.on('join', ({ conversationId }) => {
    socket.join(`conv_${conversationId}`);
  });
  socket.on('leave', ({ conversationId }) => {
    socket.leave(`conv_${conversationId}`);
  });
  socket.on('sendMessage', msg => {
    // broadcast to room
    io.to(`conv_${msg.conversation_id}`).emit('newMessage', msg);
  });
  socket.on('markSold', ({ conversation_id }) => {
    io.to(`conv_${conversation_id}`).emit('sold');
  });
  socket.on('markReceived', ({ conversation_id }) => {
    io.to(`conv_${conversation_id}`).emit('received');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));