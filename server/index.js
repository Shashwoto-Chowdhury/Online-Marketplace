const express = require('express');
const pool = require('./db');
const path = require('path');
const cors = require('cors');

var userRouter = require('./router/userRouters');
var adminRouter = require('./router/adminRouters');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use('/images/products', express.static(path.join(__dirname, 'public/images/products')));
app.use('/images/users', express.static(path.join(__dirname, 'public/images/users')));

app.use('/users', userRouter);
app.use('/admin', adminRouter);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});


