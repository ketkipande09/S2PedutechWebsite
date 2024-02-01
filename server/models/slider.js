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
        name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // studentName: {
      //   type: DataTypes.STRING,
      //   allowNull: false,
      // },
      // companyName: {
      //   type: DataTypes.STRING,
      //   allowNull: false,
      // },
      // collegeName: {
      //   type: DataTypes.STRING,
      //   allowNull: false,
      // },
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
  // Test.associate = (models) => {
  // 	Test.belongsTo(models.ShopInventory, {
  // 		foreignKey: 'shopInventoryId',
  // 		as: 'shopInventory',
  // 		onDelete: 'CASCADE',
  // 	});
  // 	Test.belongsTo(models.Order, {
  // 		foreignKey: 'orderId',
  // 		as: 'order',
  // 		onDelete: 'CASCADE',
  // 	});
  // };
  // (async () => {
  // 	if (process.env.ENVIRONMENT !== 'prod') {
  // 		await sequelize.sync();
  // 	}
  // })();
  // (async () => {
  // 	if (process.env.ENVIRONMENT !== 'prod') {
  // 		await sequelize.sync({ force: false, alter: true, logging: true });
  // 	}
  // })();

  return Slider;
};
