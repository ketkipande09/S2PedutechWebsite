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
      image: {
        type: DataTypes.STRING(1324),
        allowNull: true,
        get() {
          if (this.getDataValue('image'))
            return (
              process.env.DOMAIN_URL +
              'image/' +
              this.getDataValue('image')
            );
        },
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  return Home;
};
