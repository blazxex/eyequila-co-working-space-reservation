const User = require("../models/User");
const Space = require("../models/WorkingSpace");
const QRCode = require("qrcode");
const jwt = require("jsonwebtoken");
const Room = require("../models/Room");
const Reservation = require("../models/Reservation");
const { checkReservationConstraints } = require("../middleware/reservation");

exports.getReservation = async (req, res) => {
  try {
    const currentTime = new Date();
    const reservationId = req.params.reservationId;
    if (!reservationId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing reservationId" });
    }

    const reservation = await Reservation.findById(reservationId).populate(
      "room"
    );
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
exports.getReservations = async (req, res) => {
  try {
    const currentTime = new Date();
    console.log(req.user);
    const filter =
      req.user.role !== "admin"
        ? { user: req.user.id, endTime: { $gt: currentTime } }
        : { endTime: { $gt: currentTime } };

    const reservations = await Reservation.find(filter).populate("room");

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Cannot retrieve reservations",
    });
  }
};

exports.createReservation = async (req, res) => {
  try {
    const { startTime, endTime, capacity } = req.body;
    const roomId = req.params.roomId;

    if (!roomId || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    // TODO Check if the user has reached the reservation limit or not

    const { startDateTime, endDateTime } = await checkReservationConstraints({
      roomId,
      startTime,
      endTime,
      capacity,
    });

    const newReservation = new Reservation({
      room: roomId,
      user: req.user.id,
      startTime: startDateTime,
      endTime: endDateTime,
      capacity: capacity,
    });

    await newReservation.save();

    return res.status(201).json({
      success: true,
      message: "Reservation created successfully",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a reservation
// @route   PUT /reservations/:reservationId
// @access  Registered User (Owner) / Admin
exports.editReservation = async (req, res) => {
  try {
    const { startTime, endTime, capacity } = req.body;
    const reservationId = req.params.reservationId;

    let reservation = await Reservation.findById(reservationId);
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

    const { startDateTime, endDateTime } = await checkReservationConstraints({
      roomId: reservation.room,
      startTime,
      endTime,
      capacity: capacity || reservation.capacity,
      reservationId,
    });

    reservation.startTime = startDateTime;
    reservation.endTime = endDateTime;
    reservation.capacity = capacity || reservation.capacity;

    reservation = await reservation.save();
    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
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

    const payload = jwt.verify(token, process.env.JWT_SECRET);
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
