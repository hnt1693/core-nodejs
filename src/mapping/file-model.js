const {DataTypes} = require('sequelize');
const {sequelize} = require('@utils/db-helper2');
const FILE_TYPES = {
    AVATAR: 0
};
const File = sequelize.define('files', {
    id: {
        type         : DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey   : true
    },
    path: {
        type     : DataTypes.STRING,
        allowNull: false
    },
    originalName: {
        field    : 'original_name',
        type     : DataTypes.STRING,
        allowNull: false,
        unique   : false
    },
    mimeType: {
        field    : 'mimetype',
        type     : DataTypes.STRING,
        allowNull: false
    },
    size: {
        type     : DataTypes.INTEGER,
        allowNull: false
    }, destination: {
        type     : DataTypes.STRING,
        allowNull: false
    }, type: {
        type     : DataTypes.INTEGER,
        allowNull: false
    }
}, {
    // Other model options go here
    timestamps  : true,
    updatedAt   : true,
    createdAt   : true,
    deletedAt   : true,
    defaultScope: {
        attributes: {
            exclude: ['user_id']
        }
    }
});
module.exports = {
    File, FILE_TYPES
};
