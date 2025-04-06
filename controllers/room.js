const Room = require("../models/Room.js");
exports.getRooms = async (req, res) => {
  try {
    const spaceId = req.params.spaceId;

    const query = spaceId ? { space: spaceId } : {};
    const rooms = await Room.find(query);

    if (!rooms) {
      return res.status(404).json({
        success: false,
        message: "Can not find room",
      });
    }
    return res.status(200).json({
      success: true,
      message: "find room successful",
      data: rooms,
    });
  } catch (err) {
    res.status(400).json({ success: false });
    console.log(err.stack);
  }
  return res.sendstatus(200);
};

exports.getRoom = async (req, res) => {
  try {
    const roomId = req.params.RoomId;
    const room = await Room.findById(roomId);
    console.log(roomId, "S");
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
