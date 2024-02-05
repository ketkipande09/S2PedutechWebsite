const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
const jwtOptions = require('../config/options/jwt.options');
const { OPTIONS, generateURl } = require('../config/options/global.options');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      resetPin: {
        type: DataTypes.INTEGER,
        required: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      changeEmail: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      mobileNumber: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      mobileCode: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      countryCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      countryName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      pinCode: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      websiteUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      bio: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      dob: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      verificationToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      verificationTokenExpireAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isEmailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isMobileNumberVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      permissions: {
        type: DataTypes.STRING,
        allowNull: true,
        get: function () {
          return JSON.parse(this.getDataValue('permissions'));
        },
        set: function (val) {
          return this.setDataValue('permissions', JSON.stringify(val));
        },
      },
      passwordResetToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      passwordResetExpires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: OPTIONS.defaultStatus.ACTIVE,
      },
      google: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      facebook: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      profilePicture: {
        type: DataTypes.BLOB('long'),
        allowNull: true,
        get() {
          if (this.getDataValue('profilePicture') !== null)
            return this.getDataValue('profilePicture').toString('utf8');
        },
      },
      socialProfilePicture: {
        type: DataTypes.BLOB('long'),
        allowNull: true,
        get() {
          if (this.getDataValue('socialProfilePicture') !== null)
            return this.getDataValue('socialProfilePicture').toString('utf8');
        },
      },
      coverPicture: {
        type: DataTypes.BLOB('long'),
        allowNull: true,
        get() {
          if (this.getDataValue('coverPicture') !== null)
            return this.getDataValue('coverPicture').toString('utf8');
        },
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  User.prototype.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
  };
  User.prototype.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
  };
  User.prototype.genToken = function () {
    const payload = { id: this.id };
    return jwt.sign(payload, jwtOptions.secretOrKey);
  };
  // User.associate = function (models) {
  // 	User.belongsTo(models.Shop, {
  // 		foreignKey: 'shopId',
  // 		as: 'shop',
  // 		onDelete: 'CASCADE',
  // 	});
  // 	User.belongsTo(models.Supplier, {
  // 		foreignKey: 'supplierId',
  // 		as: 'supplier',
  // 		onDelete: 'CASCADE',
  // 	});
  // 	User.belongsTo(models.Employees, {
  // 		foreignKey: 'employeeId',
  // 		as: 'employees',
  // 		onDelete: 'CASCADE',
  // 	});
  // };
  (async () => {
    if (process.env.ENVIRONMENT !== 'prod') {
      await sequelize.sync({ alter: true, logging: false });
    }
  })();
    //  { force: false, alter: true, logging: true }
  return User;
};
