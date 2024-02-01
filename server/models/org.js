const { OPTIONS } = require("../config/options/global.options");

module.exports = (sequelize, DataTypes) => {
    const Org = sequelize.define(
      "Org",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        orgName: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        address: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        mobile: {
          type: DataTypes.BIGINT,
          allowNull: true,
        },
        alternateMobile: {
          type: DataTypes.BIGINT,
          allowNull: true,
        },
        status: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: OPTIONS.defaultStatus.ACTIVE,
        },
      },
      {
        timestamps: true,
        freezeTableName: true,
      }
    );

    return Org;
};
