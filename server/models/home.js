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
        allowNull: true,
      },
      placementCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  return Home;
};
