const {Sequelize, Model, DataTypes} = require("sequelize");
const {sequelize} = require("@utils/db-helper2")
const {Match} = require("@mapping/match.model")
const FILE_TYPES = {
    AVATAR: 0,
}
const Team = sequelize.define('teams', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    shortName: {
        field: "shortname",
        type: DataTypes.STRING,
        allowNull: false,
        unique: false
    }
    , img: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    timestamps: false,
});

Team.hasOne(Match, {foreignKey: "team1_id", as: 'team1', onDelete: 'CASCADE', hooks: true})
Match.belongsTo(Team, {as: "team1", foreignKey: "team1_id"});
Team.hasOne(Match, {foreignKey: "team2_id", as: 'team2', onDelete: 'CASCADE', hooks: true})
Match.belongsTo(Team, {as: "team2", foreignKey: "team2_id"});
module.exports = {
    Team, FILE_TYPES
}