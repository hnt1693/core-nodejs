const {DataTypes} = require('sequelize');
const {File} = require('@mapping/file-model');
const {sequelize} = require('@utils/db-helper2');
const User = sequelize.define('users', {
  id: {
    type         : DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey   : true
  },
  username: {
    field    : 'username',
    type     : DataTypes.STRING,
    allowNull: false,
    unique   : true,
    validate : {
      min: 5,
      max: 50
    }
  }, fullName: {
    field    : 'fullname',
    type     : DataTypes.STRING,
    allowNull: true,
    unique   : false,
    validate : {
      min: 5,
      max: 50
    }
  },
  password: {
    type     : DataTypes.STRING,
    allowNull: false,
    unique   : false
  },
  email: {
    type     : DataTypes.STRING,
    allowNull: false,
    unique   : true,
    validate : {
      isEmail: true
    }
  },
  type: {
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
      exclude: ['password']
    },
    order: [['id', 'DESC']],
    where: {
      deletedAt: null
    }
  },
  scopes: {
    withPassword: {
      attributes: {
        include: ['password']
      }
    }
  }
});

User.hasMany(File, {foreignKey: 'user_id', as: 'files'});
User.hasOne(File,
    {foreignKey: 'user_id', as: 'avatar', onDelete: 'CASCADE', hooks: true});
File.belongsTo(User, {as: 'avatar', foreignKey: 'user_id'});
File.belongsTo(User, {as: 'files', foreignKey: 'user_id'});
module.exports = {
  User
};
