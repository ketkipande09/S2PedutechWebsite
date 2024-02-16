const { OPTIONS, generateURl } = require("../config/options/global.options");

module.exports = (sequelize, DataTypes) => {
  const Slider = sequelize.define(
    "Slider",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING(1324),
        allowNull: true,
        get() {
          if (this.getDataValue("image"))
            return (
              process.env.DOMAIN_URL +
              "sliderImage/" +
              this.getDataValue("image")
            );
        },
      },
      videoUrl: {
        type: DataTypes.STRING,
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


  return Slider;
};
