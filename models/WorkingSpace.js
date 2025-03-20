const mongoose = require("mongoose");

const WorkingSpaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  address: {
    type: String,
    required: [true, "Please add an address"]
  },
  phoneNumber: {
    type: String,
    require: [true, "Please add an address"]
  },
  openTime: {
    type: String,
    required: [true, "Please add open time"],
    default: "08:00"
  },
  closeTime: {
    type: String,
    required: [true, "Please add close time"],
    default: "20:00"
  }
},
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

WorkingSpaceSchema.virtual('Room', {
  ref: 'Room',
  localField: '_id',
  foreignField: 'space',
  justOne: false
})


module.exports = mongoose.model("WorkingSpace", WorkingSpaceSchema);
