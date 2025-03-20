const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
//Router
const authRouter = require('./routes/auth.js')
const userRouter = require('./routes/user.js')
const workingSpaceRouter = require('./routes/workingSpace.js')
const roomRouter = require('./routes/room.js')

// Load env vars
dotenv.config({ path: "./config/config.env" });

connectDB();
const app = express();
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).json({ success: true, data: { id: 1 } });
});


app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/spaces', workingSpaceRouter);
app.use('/api/v1/rooms', roomRouter);


const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT,
  console.log(
    "Server running in ",
    process.env.NODE_ENV,
    " mode on port ",
    PORT
  )
);
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
