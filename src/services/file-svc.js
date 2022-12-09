const DbHelper = require('@utils/db-helper');
const DbHelper2 = require('@utils/db-helper2');
const fs = require('fs');
const {File} = require('@mapping/file-model');
const logger = require('@utils/logger');
const multer = require('multer');
const dayJs = require('dayjs');
const {FILE_TYPES} = require('@mapping/file-model');
const {Exception, EXCEPTION_TYPES} = require('@exception/custom-exception');

const {StringBuilder} = require('@utils/ultil-helper');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'storage/public/avatar');
    },
    filename: function(req, file, cb) {
        cb(null, dayJs().format('YYYYMMDDHHmmss') + '-' + file.originalname);
    }
});

const upload = multer({storage: storage, limits: {fileSize: process.env.FILE_MAXSIZE}, fileFilter: uploadFilter})
    .array('files', 12);

const avatarUploader = multer({storage: storage, limits: {fileSize: process.env.FILE_MAXSIZE}, fileFilter: filterImg})
    .array('files', 1);

function uploadFilter(req, res, cb) {
    cb(null, true);
}

function filterImg(req, file, cb) {
    const typeArray = file.mimetype.split('/');
    const fileType = typeArray[0];
    if (fileType === 'image') {
        cb(null, true);
    } else {
        cb(null, false);
    }
    cb(null, true);
}

const uploadFiles = async (req, res) => {
    return DbHelper.executeQueryWithTransaction(async (connection) => {
        try {
            const files = await write(req, res, upload);
            if (files.length === 0) {
                throw new Error('No file valid type');
            }
            const builder = new StringBuilder();

            // language=SQL format=false
            builder.append(`INSERT INTO files (filename, original_name, mimetype, encoding, destination, path, size)
                            VALUES `);
            files.forEach((ob) => {
                builder.append('(');
                builder.append(`'${ob.filename}',`);
                builder.append(`'${ob.originalname}',`);
                builder.append(`'${ob.mimetype}',`);
                builder.append(`'${ob.encoding}',`);
                builder.append(`'${ob.destination}',`);
                builder.append(`'${ob.path.replaceAll('\\', '\\\\')}',`);
                builder.append(`'${ob.size}'`);
                builder.append('),');
            });
            let sql = builder.toString();
            sql = sql.substr(0, sql.length - 1);
            await connection.queryWithLog({sql: sql, values: []});
            return files;
        } catch (e) {
            throw new Exception(e.message, EXCEPTION_TYPES.FILE).bind('upload');
        }
    });
};


const uploadAvatar = (req, res) => {
    return DbHelper2.execute(async (transaction) => {
        try {
            const files = await write(req, res, avatarUploader);
            if (files.length === 0) {
                throw new Error('No file valid type');
            }
            const file = await File.create({
                ...files[0],
                originalName: files[0].originalname,
                mimeType    : files[0].mimetype,
                type        : FILE_TYPES.AVATAR
            });
            await file.save();
            return file;
        } catch (e) {
            throw new Exception(e.message, EXCEPTION_TYPES.FILE).bind('upload');
        }
    });
};


// const downloadFiles = async (fileId) => {
//     return DbHelper.executeQuery(async (connection) => {
//         try {
//             const files = await write();
//             return files;
//         } catch (e) {
//             throw new Exception(e.message, EXCEPTION_TYPES.FILE).bind('upload');
//         }
//     });
// };

const write = (req, res, multer) => {
    return new Promise((resolve, reject) => {
        multer(req, res, function(err) {
            if (err) {
                reject(new Exception(err.message, EXCEPTION_TYPES.FILE).bind('upload'));
            } else {
                const file = req.files;
                if (!file) {
                    reject(new Exception(err.message, EXCEPTION_TYPES.FILE).bind('upload'));
                }
                return resolve(file);
            }
        });
    });
};

const removeFiles = (files) => {
    return DbHelper.executeQueryWithTransaction(async (connection) => {
        const fileIds = [];
        files.forEach((ob) => {
            logger.info('Remove file : ' + ob.filename);
            fs.unlinkSync(ob.path);
            if (ob.id) {
                fileIds.push(ob.id);
            }
        });
        if (fileIds.length > 0) {
            const data = await connection.queryWithLog({
                sql   : `DELETE FROM files where id in (${fileIds.join(',')})`,
                values: []
            });
            return data;
        }
    });
};

module.exports = {writeFile: uploadFiles, uploadAvatar, removeFiles};

