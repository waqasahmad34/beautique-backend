/* eslint-disable linebreak-style */
import multer from 'multer';

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'app/public/users/defaultCategory');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const defaultCategory = multer({ storage: storage });

export default defaultCategory;
