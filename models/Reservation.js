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
  startDate: {
    type: Date,
    require: true
  },
  endDate: {
    type: Date,
    require: true
  }
})

module.exports = mongoose.model("Reservation", ReservationSchema);
