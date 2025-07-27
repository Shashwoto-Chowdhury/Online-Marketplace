const express = require('express');
const path = require('path');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

var userRouter  = require('./router/userRouters');
var adminRouter = require('./router/adminRouters');
const convoRouter = require('./router/user/conversations');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/images/products', express.static(path.join(__dirname, 'public/images/products')));
app.use('/images/users',    express.static(path.join(__dirname, 'public/images/users')));

app.use('/users', userRouter);
app.use('/admin', adminRouter);
app.use('/users/conversations', convoRouter);

// create a single HTTP server for both Express and Socket.io
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// make io available to your routers via req.app.get('io')
app.set('io', io);

io.on('connection', socket => {
  socket.on('join', ({ conversationId }) => socket.join(`conv_${conversationId}`));
  socket.on('leave',({ conversationId }) => socket.leave(`conv_${conversationId}`));
  socket.on('sendMessage', msg => io.to(`conv_${msg.conversation_id}`).emit('newMessage', msg));
  socket.on('markSold',    ({ conversation_id }) => io.to(`conv_${conversation_id}`).emit('sold'));
  socket.on('markReceived',({ conversation_id }) => io.to(`conv_${conversation_id}`).emit('received'));
});

server.listen(PORT, () => {
  console.log(`Server + Socket.io running on port ${PORT}`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
});


