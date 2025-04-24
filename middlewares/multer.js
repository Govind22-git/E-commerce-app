const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'infinityElectronic/Images', // change based on use case
    allowed_formats: ['jpg', 'png', 'jpeg', 'WebP' ],
  },
});

const upload = multer({ storage });

module.exports = upload;
