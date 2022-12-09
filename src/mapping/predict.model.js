const {Sequelize, Model, DataTypes} = require("sequelize");
const {sequelize} = require("@utils/db-helper2")
const {Match} = require("@mapping/match.model")
const {User} = require("@mapping/user-model")
const Predict = sequelize.define('predicts', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    team1Score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    team2Score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0
        }
    }
}, {
    // Other model options go here
    timestamps: false,
    uniqueKeys: {
        predict_unique: {
            fields: ['user_id', 'match_id']
        }
    },
    defaultScope:{
        attributes:{
            exclude:["user_id","match_id"]
        }

    }
});

User.hasMany(Predict, {foreignKey: "user_id", as: 'user', onDelete: 'CASCADE', hooks: true})
Predict.belongsTo(User, {as: "user", foreignKey: "user_id"});
Match.hasOne(Predict, {foreignKey: "match_id", as: 'match', onDelete: 'CASCADE', hooks: true})
Predict.belongsTo(Match, {as: "match", foreignKey: "match_id"});
Match.hasMany(Predict, {foreignKey: "match_id", as: 'predicts', onDelete: 'CASCADE', hooks: true})
Predict.belongsTo(Match, {as: "predicts", foreignKey: "match_id"});

module.exports = {
    Predict
}