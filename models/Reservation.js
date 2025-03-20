const mongoose = require("mongoose");

const ReservationSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, "Please add an name"]
  },
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
