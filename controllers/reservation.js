const Reservation = require("../models/Reservation");
const Space = require("../models/WorkingSpace");
const QRCode = require("qrcode");
const jwt = require("jsonwebtoken");

exports.getReservations = async (req, res) => {
  try {
    let query;
    const currentTime = new Date();

    if (req.user.role !== "admin") {
      query = Reservation.find({
        user: req.user.id,
        endTime: { $gt: currentTime },
      }).populate("room");
    } else {
      query = Reservation.find({ endTime: { $gt: currentTime } }).populate(
        "room"
      );
    }

    const reservations = await query;
    res
      .status(200)
      .json({ success: true, count: reservations.length, data: reservations });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Cannot retrieve reservations" });
  }
};
exports.getReservation = async (req, res) => {
  try {
    const currentTime = new Date();
    const reservation = await Reservation.findById(
      req.params.reservationId
    ).populate("room");
    if (!reservation || reservation.endTime <= currentTime) {
      return res
        .status(404)
        .json({ success: false, message: "Reservation not found or expired." });
    }
    if (
      reservation.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this reservation.",
      });
    }
    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Cannot retrieve reservation" });
  }
};
exports.createReservation = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;
    const { spaceId, roomId } = req.params;

    if (!roomId || !startTime || !endTime || !spaceId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newStartTime = new Date(startTime);
    const newEndTime = new Date(endTime);

    if (newStartTime >= newEndTime) {
      return res
        .status(400)
        .json({ message: "End time must be after start time" });
    }

    // Validate Timeboxing (Must be full-hour slots)
    if (
      newStartTime.getMinutes() !== 0 ||
      newEndTime.getMinutes() !== 0 ||
      newEndTime - newStartTime !== 60 * 60 * 1000
    ) {
      return res.status(400).json({
        message: "Reservations must be in 1-hour slots (e.g., 12:00 - 13:00)",
      });
    }

    // Check for Overlapping Reservations
    const overlappingReservation = await Reservation.findOne({
      roomId,
      $or: [
        { startTime: { $lt: newEndTime }, endTime: { $gt: newStartTime } }, // Overlapping condition
      ],
    });

    if (overlappingReservation) {
      return res.status(400).json({ message: "Time slot is already reserved" });
    }

    // 2️⃣ Check Workspace Open and Close Hours
    const workspace = await Space.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    //const workspaceOpen = new Date(newStartTime);
    //const workspaceClose = new Date(newStartTime);
    const [openHour, openMinute] = workspace.openTime.split(":").map(Number);
    const [closeHour, closeMinute] = workspace.closeTime.split(":").map(Number);

    workspaceOpen.setHours(openHour, openMinute, 0, 0);
    workspaceClose.setHours(closeHour, closeMinute, 0, 0);

    if (newStartTime < workspaceOpen || newEndTime > workspaceClose) {
      return res
        .status(400)
        .json({ message: "Reservation must be within working hours" });
    }

    // Save the Reservation
    const newReservation = new Reservation({
      room: roomId,
      user: user.id,
      startTime: newStartTime,
      endTime: newEndTime,
    });
    await newReservation.save();

    return res
      .status(201)
      .json({ message: "Reservation created successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a reservation
// @route   PUT /reservations/:reservationId
// @access  Registered User (Owner) / Admin
exports.editReservation = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;
    let reservation = await Reservation.findById(req.params.reservationId);

    if (!reservation) {
      return res
        .status(404)
        .json({ success: false, message: "Reservation not found." });
    }
    if (
      reservation.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this reservation.",
      });
    }

    if (startTime && endTime) {
      const newStartTime = new Date(startTime);
      const newEndTime = new Date(endTime);
      if (newStartTime >= newEndTime) {
        return res.status(400).json({
          success: false,
          message: "End time must be after start time.",
        });
      }
      if (
        !(
          [0, 30].includes(newStartTime.getMinutes()) &&
          [0, 30].includes(newEndTime.getMinutes())
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Start and end times must be on the hour or half-hour.",
        });
      }
      reservation.startTime = newStartTime;
      reservation.endTime = newEndTime;
    }

    reservation = await reservation.save();
    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Cannot update reservation" });
  }
};
// @desc    Delete a reservation
// @route   DELETE /reservations/:reservationId
// @access  Registered User (Owner) / Admin
exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.reservationId);
    if (!reservation) {
      return res
        .status(404)
        .json({ success: false, message: "Reservation not found." });
    }
    if (
      reservation.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this reservation.",
      });
    }
    await reservation.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "Reservation deleted successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Cannot delete reservation" });
  }
};

exports.getReservationQR = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const user = req.user;

    const reservation = await Reservation.findById(reservationId).populate(
      "room"
    );
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    if (reservation.user.toString() !== user.id && user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const now = new Date();
    if (reservation.endTime < now) {
      return res.status(400).json({ message: "Reservation already expired" });
    }

    const token = jwt.sign(
      {
        reservationId: reservation._id,
        userId: user.id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    const qrUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/reservation/verify?token=${token}`;
    const qrImage = await QRCode.toDataURL(qrUrl);

    return res.status(200).json({
      success: true,
      data: {
        qrCode: qrImage,
        qrUrl,
        expiresIn: "10 minutes",
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to generate QR code" });
  }
};

exports.verifyQRCode = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: "Token is required" });

    const payload = jwt.verify(token, SECRET_KEY);
    const reservation = await Reservation.findById(
      payload.reservationId
    ).populate("room");

    if (!reservation || reservation.endTime < new Date()) {
      return res
        .status(404)
        .json({ message: "Invalid or expired reservation" });
    }

    return res.status(200).json({ success: true, data: reservation });
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
