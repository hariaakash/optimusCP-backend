module.exports = function(req, res, uniR, multer) {
    var filename = Date.now() + hat();
    var storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, './uploads/')
        },
        filename: function(req, file, cb) {
            cb(null, filename + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
        }
    });
    var upload = multer({
        storage: storage
    }).single('file');
    upload(req, res, function(err) {
        if (err) {
            uniR(res, false, 'Error uploading file')
        } else {
            res.json({
                status: true,
                file: filename
            })
        }
    });
};
