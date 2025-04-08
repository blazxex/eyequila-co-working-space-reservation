const mongoose = require("mongoose");

const ReservationSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.ObjectId,
    ref: "Room",
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
    default: 4,
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now,
  },
  endTime: {
    type: Date,
    required: true,
    default: function () {
      return new Date(Date.now() + 30 * 60 * 1000);
    },
  },
});

ReservationSchema.pre("save", function (next) {
  if (this.startTime >= this.endTime) {
    return next(new Error("End time must be after start time"));
  }
  next();
});

module.exports = mongoose.model("Reservation", ReservationSchema);
