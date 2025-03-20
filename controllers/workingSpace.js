const Space = require('../models/WorkingSpace.js')

exports.getSpaces = async (req, res) => {
  try {
    const spaces = await Space.find();
    if (!spaces) {
      return res.status(404).json({
        success: false,
        message: "can't find working spaces",
        data: []
      });
    }
    return res.status(200).json({
      success: true,
      data: spaces
    });
  }
  catch (err) {
    res.status(400).json({ success: false });
    console.log(err.stack);
  }
}

exports.getSpace = async (req, res) => {
  const { id } = req.params;
  try {
    const space = await Space.findById(id);
    if (!space) {
      return res.status(404).json({
        success: false,
        message: "can't find working spaces",
      });
    }
    return res.status(200).json({
      success: true,
      data: space
    });
  }
  catch (err) {
    res.status(400).json({ success: false });
    console.log(err.stack);
  }
}
