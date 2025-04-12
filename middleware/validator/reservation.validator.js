const { body } = require('express-validator');

exports.reservationValidator = [
  body('roomId')
    .notEmpty().withMessage('roomId is required')
    .isString().withMessage('Invalid roomId'),

  body('startTime')
    .notEmpty().withMessage('startTime is required')
    .isISO8601().withMessage('startTime must be valid'),

  body('endTime')
    .notEmpty().withMessage('endTime is required')
    .isISO8601().withMessage('endTime must be valid'),

  body('capacity')
    .notEmpty().withMessage('capacity is required')
    .isNumeric('Invalid capacity')
];
