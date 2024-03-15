const { OPTIONS } = require("../config/options/global.options");

module.exports = (sequelize, DataTypes) => {
  const Home = sequelize.define(
    'Home',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      bulletPoint: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      OurEMPLOYEE: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      YearsExperience: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      placementCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  return Home;
};
