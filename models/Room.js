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
module.exports = mongoose.model("WorkingSpace", WorkingSpaceSchema);
