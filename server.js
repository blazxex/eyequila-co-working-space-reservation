const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
//Router
const auth = require('./routes/auth.js')
const user = require('./routes/user.js')
const workingSpace = require('./routes/workingSpace.js')

// Load env vars
dotenv.config({ path: "./config/config.env" });

connectDB();
const app = express();
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).json({ success: true, data: { id: 1 } });
});


app.use('/api/v1/auth', auth);
app.use('/api/v1/users', user);
app.use('/api/v1/spaces', workingSpace);


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
