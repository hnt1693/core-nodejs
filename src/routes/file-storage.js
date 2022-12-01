const express = require("express")
const router = express.Router();
const {writeFile} = require('@service/file-svc')
const {authWithAsync, ROLE} = require("../config/auth-middleware")

router.post('/', authWithAsync(async function (req, res, next) {
    const file = await writeFile(req, res);
    res.status(200).send({data: file, msg: "Upload file success"})
}, [ROLE.IS_AUTHENTICATED]));


router.get('/', async function (req, res, next) {
    const file = `./storage/uploads/1669694518674-Trần-Văn-Thanh_ReactJS-Developer.pdf`;
    if (fs.existsSync(file)) {
        res.download(file);
    } else {
        next(new Exception("File not found", EXCEPTION_TYPES.FILE).bind("downloadFile"))
    }

});

module.exports = router;
