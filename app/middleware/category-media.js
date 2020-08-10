/* eslint-disable linebreak-style */
import multer from 'multer';

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'app/public/users/category');
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.jpg');
  },
});
const category = multer({ storage: storage });

export default category;
