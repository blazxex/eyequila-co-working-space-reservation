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
    type: Date,
    required: [true, "Please add open time"],
  },
  closeDate: {
    type: Date,
    required: [true, "Please add close time"],
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
