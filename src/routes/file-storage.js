const express = require('express');
const router = express.Router();
const multer = require("multer")
const Exception = require("../exceptions/custom-exception")
const {authWithAsync, ROLE} = require("../config/auth-middleware")
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'storage/uploads')
    },
    filename: function (req, file, cb) {

        cb(null, Date.now() + "-" + file.originalname)
    }
})
const upload = multer({storage: storage, limits: {fileSize: 1048576}}).array("files", 12)


router.post('/', authWithAsync(async function (req, res, next) {
    upload(req, res, function (err) {
        if (err) {
            next(new Exception(err.message, "FileUploadException"))
        } else {
            const file = req.files
            if (!file) {
                next(new Exception("File not found", "FileNotFoundException"))
            }
            res.status(200).send({data: file, msg: "Upload file success"})
        }
    })
}, [ROLE.IS_AUTHENTICATED]));
router.get('/', function (req, res, next) {
    const file = `./storage/uploads/1669694518674-Trần-Văn-Thanh_ReactJS-Developer.pdf`;
    res.download(file);
});

module.exports = router;
