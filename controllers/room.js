const Room = require("../models/Room.js");
const Reservation = require("../models/Reservation.js");
const WorkingSpace = require("../models/WorkingSpace");
const dayjs = require("dayjs");
const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");
const isSameOrAfter = require("dayjs/plugin/isSameOrAfter");
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

exports.getRooms = async (req, res) => {
  try {
    const { spaceId } = req.params;
    const { startDate, endDate, requiredCapacity } = req.body;

    const query = spaceId ? { space: spaceId } : {};
    const rooms = await Room.find(query);

    if (!rooms) {
      return res.status(404).json({
        success: false,
        message: "Can not find room",
      });
    }

    // Check availability for each room if date range is provided
    const availableRooms = [];

    for (const room of rooms) {
      const reservations = await Reservation.find({
        room: room._id,
        $or: [
          { startDate: { $lt: endDate }, endDate: { $gt: startDate } }, // Overlapping reservations
        ],
      });

      // If no reservations overlap, add the room to availableRooms
      if (reservations.length === 0 && room.capacity >= requiredCapacity) {
        availableRooms.push(room);
      }
    }

    res.status(200).json({
      success: true,
      message: "find room successful",
      data: rooms,
    });
  } catch (err) {
    res.status(400).json({ success: false });
    console.log(err.stack);
  }
};

exports.getRoom = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const durationMinutes = parseInt(req.query.durationMinutes) || 30;
    const date = req.query.date || dayjs().format("YYYY-MM-DD");
    const now = dayjs();

    const room = await Room.findById(roomId).populate("space");

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const space = room.space;
    const openTime = dayjs(`${date}T${space.openTime}`);
    const closeTime = dayjs(`${date}T${space.closeTime}`);
    const dayOfWeek = dayjs(date).format("ddd").toLowerCase(); // "mon", "tue", etc.

    // If space is closed on this day
    if (!space.openDays.includes(dayOfWeek)) {
      return res.status(200).json({
        success: true,
        message: "Room fetched successfully",
        data: {
          ...room.toObject(),
          availableSlots: [],
          note: "Closed on this day",
        },
      });
    }

    // Get existing overlapping reservations
    const reservations = await Reservation.find({
      room: roomId,
      startTime: { $lt: closeTime.toDate() },
      endTime: { $gt: openTime.toDate() },
    });

    let availableSlots = [];
    let slotStart = openTime;

    while (slotStart.add(durationMinutes, "minute").isSameOrBefore(closeTime)) {
      const slotEnd = slotStart.add(durationMinutes, "minute");

      // Skip slots in the past if the queried date is today
      if (dayjs(date).isSame(now, "day") && slotStart.isBefore(now)) {
        slotStart = slotStart.add(30, "minute");
        continue;
      }

      const isOverlap = reservations.some((r) => {
        const rStart = dayjs(r.startTime);
        const rEnd = dayjs(r.endTime);
        return rStart.isBefore(slotEnd) && rEnd.isAfter(slotStart);
      });

      if (!isOverlap) {
        availableSlots.push({
          start: slotStart.format("HH:mm"),
          end: slotEnd.format("HH:mm"),
        });
      }

      slotStart = slotStart.add(30, "minute");
    }

    return res.status(200).json({
      success: true,
      message: "Room fetched successfully",
      data: {
        ...room.toObject(),
        availableSlots,
      },
    });
  } catch (err) {
    console.error(err.stack);
    return res.status(400).json({
      success: false,
      message: "Error fetching room",
    });
  }
};
