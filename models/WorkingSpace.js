const mongoose = require("mongoose");

const WorkingSpaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    phoneNumber: {
      type: String,
      require: [true, "Please add an address"],
    },
    openTime: {
      type: String,
      required: [true, "Please add open time"],
      default: "08:00",
    },
    closeTime: {
      type: String,
      required: [true, "Please add close time"],
      default: "20:00",
    },
    openDays: {
      type: [String], // Array of strings
      enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], // Restrict to valid days
      default: ["mon", "tue", "wed", "thu", "fri"],
      required: true,
    },
    is24Hours: { type: Boolean, default: false },
    reservationHourLimit: {
      type: Number,
      required: [true, "Please decide limit hour per reservation"],
      default: 2,
      min: 0,
      max: 12,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

WorkingSpaceSchema.virtual("Room", {
  ref: "Room",
  localField: "_id",
  foreignField: "space",
  justOne: false,
});

exports.checkAvailableSlots = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { date, durationMinutes } = req.body; // e.g., "2025-04-09", 30

    const room = await Room.findById(roomId).populate("space");
    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    const space = room.space;
    const dayOfWeek = dayjs(date).format("ddd").toLowerCase(); // e.g., "wed"
    if (!space.openDays.includes(dayOfWeek)) {
      return res.status(200).json({
        success: true,
        message: "Closed on this day",
        data: [],
      });
    }

    const open = dayjs(`${date}T${space.openTime}`);
    const close = dayjs(`${date}T${space.closeTime}`);

    const reservations = await Reservation.find({
      room: roomId,
      startTime: { $lt: close.toDate() },
      endTime: { $gt: open.toDate() },
    });

    const slots = [];
    let slotStart = open;

    while (slotStart.add(durationMinutes, "minute").isSameOrBefore(close)) {
      const slotEnd = slotStart.add(durationMinutes, "minute");

      const isOverlap = reservations.some((r) => {
        const rStart = dayjs(r.startTime);
        const rEnd = dayjs(r.endTime);
        return rStart.isBefore(slotEnd) && rEnd.isAfter(slotStart);
      });

      if (!isOverlap) {
        slots.push({
          start: slotStart.format("HH:mm"),
          end: slotEnd.format("HH:mm"),
        });
      }

      slotStart = slotStart.add(30, "minute"); // Step forward 30 min (or durationMinutes if you prefer)
    }

    res.status(200).json({
      success: true,
      message: "Available slots fetched",
      data: slots,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
module.exports = mongoose.model("WorkingSpace", WorkingSpaceSchema);
