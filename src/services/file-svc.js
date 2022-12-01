const DbHelper = require("@utils/db-helper")
const fs = require("fs");
const multer = require("multer")
const dayJs = require("dayjs")
const {Exception, EXCEPTION_TYPES} = require("@exception/custom-exception")

const {StringBuilder} = require("@utils/ultil-helper")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'storage/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, dayJs().format("YYYYMMDDHHmmss") + "-" + file.originalname)
    }
})
const upload = multer({storage: storage, limits: {fileSize: process.env.FILE_MAXSIZE}}).array("files", 12)


const uploadFiles = async (req, res) => {
    return DbHelper.executeQueryWithTransaction(async (connection) => {
        try {
            let files = await write(req, res);
            let builder = new StringBuilder();

            // language=SQL format=false
            builder.append(`INSERT INTO files (filename, original_name, mimetype, encoding, destination, path, size)
                            VALUES `);

            files.forEach(ob => {
                builder.append("(");
                builder.append(`'${ob.filename}',`);
                builder.append(`'${ob.originalname}',`);
                builder.append(`'${ob.mimetype}',`);
                builder.append(`'${ob.encoding}',`);
                builder.append(`'${ob.destination}',`);
                builder.append(`'${ob.path}',`);
                builder.append(`'${ob.size}'`);
                builder.append(`),`);
            })
            let sql = builder.toString();
            sql = sql.substr(0, sql.length - 1)
            await connection.queryWithLog({sql: sql, values: []});
            return files;
        } catch (e) {
            throw new Exception(e.message, EXCEPTION_TYPES.FILE).bind("upload");
        }
    })


}

const downloadFiles = async (fileId) => {
    return DbHelper.executeQuery(async (connection) => {
        try {
            let files = await write();
            return files;
        } catch (e) {
            throw new Exception(e.message, EXCEPTION_TYPES.FILE).bind("upload");
        }
    })
}

const write = (req, res) => {
    return new Promise((resolve, reject) => {
        upload(req, res, function (err) {
            if (err) {
                reject(new Exception(err.message, EXCEPTION_TYPES.FILE).bind("upload"))
            } else {
                const file = req.files
                if (!file) {
                    reject(new Exception(err.message, EXCEPTION_TYPES.FILE).bind("upload"))
                }
                return resolve(file);
            }
        })
    })
}

const removeFiles = (files)=>{
   files.forEach(ob=>{
       fs.unlinkSync(ob.path);
   })
}

module.exports = {writeFile: uploadFiles, downloadFiles}

