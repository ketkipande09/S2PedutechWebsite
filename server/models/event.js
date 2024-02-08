

const { OPTIONS, generateURl } = require('../config/options/global.options');


module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define(
    "Event",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      shortDescription: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      eventLink: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      eventName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      eventStatus: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      status: {
        type: DataTypes.ENUM("Active", "Inactive"),
        allowNull: true,
        defaultValue: "Active",
      },
      image: {
        type: DataTypes.STRING(1324),
        allowNull: true,
        get() {
          if (this.getDataValue("image"))
            return (
              process.env.DOMAIN_URL +
              "eventImage/" +
              this.getDataValue("image")
            );
        },
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    },

  );


  return Event;
};
