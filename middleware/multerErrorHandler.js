const upload = require('./multerUpload');
const multer = require('multer');

module.exports.errHandle = async (req, res, next) => {
    upload.single('credImage')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ msg: 'File size is too large (>=1MB)', success: false });
            }
            return res.status(500).json({ msg: `Error uploading file ＞︿＜`, success: false });
        } else if (err) {
            return res.status(500).json({ msg: `Error uploading file ＞︿＜`, success: false });
        }
        next();
    });
}