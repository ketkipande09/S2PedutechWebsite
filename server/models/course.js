const { OPTIONS, generateURl } = require("../config/options/global.options");

module.exports = (sequelize, DataTypes) => {
    const Course = sequelize.define(
      'Course',
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
        // displayName: {
        //     type: DataTypes.STRING,
        //     allowNull: false,
        // },
        description: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        // duration: {
        //     type: DataTypes.STRING,
        //     allowNull: true,

        // },
        image: {
          type: DataTypes.STRING(1324),
          allowNull: true,
          get() {
            if (this.getDataValue('image'))
              return (
                process.env.DOMAIN_URL +'image/' + this.getDataValue('image')
              );
          },
        },
        // status: {
        //     type: DataTypes.STRING,
        //     allowNull: false,
        //     defaultValue: OPTIONS.defaultStatus.ACTIVE,
        // },
        // fee: {
        //     type: DataTypes.INTEGER,
        //     allowNull: true,
        // },
      },
      {
        timestamps: true,
        freezeTableName: true,
      }
    );
    // Course.associate = models => {
    //     Course.belongsTo(models.ContentId, {
    //         foreignKey: "contentId",
    //         as: "content",
    //         onDelete: "CASCADE",
    //     });
    // };

    // (async () => {
    //     if (process.env.ENVIRONMENT !== "prod") {
    //         await sequelize.sync();
    //     }
    // })();

    return Course;
};
