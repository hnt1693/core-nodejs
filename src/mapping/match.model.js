const {DataTypes} = require('sequelize');
const {sequelize} = require('@utils/db-helper2');

const FILE_TYPES = {
    AVATAR: 0
};
const Match = sequelize.define('matches', {
    id: {
        type      : DataTypes.INTEGER,
        primaryKey: true
    },
    league: {
        type     : DataTypes.STRING,
        allowNull: false
    },
    org: {
        type     : DataTypes.STRING,
        allowNull: false
    },
    team1Score: {
        type     : DataTypes.INTEGER,
        allowNull: true
    },
    team2Score: {
        type     : DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type     : DataTypes.STRING,
        allowNull: true
    },
    time: {
        type     : DataTypes.BIGINT,
        allowNull: false
    }
}, {
    // Other model options go here
    timestamps  : false,
    defaultScope: {
        attributes: {
            exclude: ['team1_id', 'team2_id']
        }
    }
});


module.exports = {
    Match, FILE_TYPES
};
