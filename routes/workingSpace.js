const express = require("express");
const { getSpaces, getSpace } = require("../controllers/workingSpace");
const roomRouter = require('../routes/room.js')

const router = express.Router();

router.use('/:spaceId/rooms/', roomRouter);

router.route('/').get(getSpaces);
router.route('/:id').get(getSpace);
module.exports = router;
