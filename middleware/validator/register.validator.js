const { body } = require('express-validator');

exports.registerValidator = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),

  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email must be valid'),

  body('phoneNumber')
    .notEmpty().withMessage('Phone number is required')
    .isMobilePhone().withMessage('Invalid phone number'),

  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['user', 'admin']) // Adjust based on your roles
    .withMessage('Invalid role')
];
