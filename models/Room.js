const mongoose = require("mongoose");
const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, "Please add an name"]
  },
  space: {
    type: mongoose.Schema.ObjectId,
    ref: "WorkingSpace",
    require: true
  },
  capacity: {
    type: Number,
    require: true,
    default: 4,
    min: [1, "Capacity must be at least 1"]
  }
},
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

RoomSchema.virtual('Reservation', {
  ref: 'Reservation',
  localField: '_id',
  foreignField: 'room',
  justOne: false
})
module.exports = mongoose.model("Room", RoomSchema);
