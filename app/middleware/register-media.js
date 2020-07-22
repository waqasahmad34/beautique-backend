/* eslint-disable linebreak-style */
import multer from 'multer';

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'app/public/users/profile');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const profile = multer({ storage: storage });

export default profile;
