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
  },
  openDays: {
    type: [String], // Array of strings
    enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], // Restrict to valid days
    default : ["mon", "tue", "wed", "thu", "fri"],
    required: true
  },
  is24Hours: { type: Boolean, default: false },
  reservationHourLimit : {
    type : Number,
    required : [true, "Please decide limit hour per reservation"],
    default : 2,
    min: 0,
    max: 12
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
