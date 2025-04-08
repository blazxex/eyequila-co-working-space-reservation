const Room = require("../models/Room.js");
const Reservation = require("../models/Reservation.js");
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
    const roomId = req.params.RoomId;
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Room fetched successfully",
      data: room,
    });
  } catch (err) {
    console.error(err.stack);
    return res.status(400).json({
      success: false,
      message: "Error fetching room",
    });
  }
};

exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "can't find this room"
      })
    }
    return res.status(200).json({
      success: true,
      message: "can't find this room",
      data: room
    })
  }
  catch (err) {
    res.status(500).json({ success: false, message: error.message });
  }

}
