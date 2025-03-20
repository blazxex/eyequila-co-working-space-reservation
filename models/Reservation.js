const mongoose = require("mongoose");

const ReservationSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.ObjectId,
    ref: "Room",
    require: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    require: true
  },
  capacity: {
    type: Number,
    require: true,
    default: 4
  }
})

module.exports = mongoose.model("Reservation", ReservationSchema);
