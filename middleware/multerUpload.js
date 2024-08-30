const multer = require('multer');

const storage = multer.diskStorage({
    filename: function(req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    limits:{ fileSize: 1000000 }
});

module.exports = upload;