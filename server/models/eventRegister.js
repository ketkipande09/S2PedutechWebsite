const { OPTIONS, generateURl } = require("../config/options/global.options");
const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
  const eventRegister = sequelize.define(
    "eventRegister",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      eventId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Event",
          key: "id",
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      collegeName: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      mobile: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
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
    
  eventRegister.associate = (models) => {
    eventRegister.belongsTo(models.Event, {
      foreignKey: "eventId",
      as: "registerDetails",
      onDelete: "CASCADE",
      constrains: false,
    });
  };
  eventRegister.prototype.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
  };
  return eventRegister;
};
