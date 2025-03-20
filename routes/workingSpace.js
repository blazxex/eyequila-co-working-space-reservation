const express = require("express");
const { getSpaces, getSpace } = require("../controllers/workingSpace");
const room = rquire('../routes/room.js')

const router = express.Router();

router.route('/:SpaceId/rooms/', room);

router.route('/').get(getSpaces);
router.route('/:id').get(getSpace);
module.exports = router;
