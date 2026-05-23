const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');

router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const imageUrl = `http://localhost:${process.env.PORT || 5001}/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

module.exports = router;
