const Room = require('../models/Room.js')
exports.getRooms = async (req, res) => {
  try {
    const { spaceId } = req.params;
    const { startDate, endDate, capacity } = req.body;

    const requiredCapacity = capacity ? capacity : 1;

    // Find rooms by spaceId (if provided)
    const query = spaceId ? { space: spaceId } : {};
    const rooms = await Room.find(query);

    // If no startDate and endDate are provided, return all rooms in the space
    if (!startDate || !endDate) {
      return res.status(200).json({
        success: true,
        count: rooms.length,
        data: rooms.filter(room => room.capacity >= requiredCapacity), // Apply capacity filter if needed
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
      count: availableRooms.length,
      data: availableRooms,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
