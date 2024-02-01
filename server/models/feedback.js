const { OPTIONS, generateURl } = require('../config/options/global.options');

module.exports = (sequelize, DataTypes) => {
  const Feedback = sequelize.define(
    "Feedback",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      // eventId: {
      //   type: DataTypes.INTEGER,
      //   references: {
      //     model: "Event",
      //     key: "id",
      //   },
      // },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
     message: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      contact: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      
      // status: {
      //   type: DataTypes.STRING,
      //   allowNull: false,
      //   defaultValue: OPTIONS.defaultStatus.ACTIVE,
      // },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );
  Feedback.associate = (models) => {
  Feedback.belongsTo(models.Event, {
    foreignKey: 'eventId',
    as: 'feedbackDetails',
    onDelete: 'CASCADE',
    constrains: false,
  });

//    models.Event.belongsToMany(Feedback, {
//      as: 'feedback',
//      through: 'feedbacks',
//      foreignKey: 'eventId',
//      onDelete: 'CASCADE',
//      hooks: true,
//    });
  // models.document_category.belongsTo(models.assets_category, {
  //   foreignKey: 'ASSEST'
  // });
  // };
  //   Feedback.associate = models => {
  //     Feedback.belongsTo(models.Event, {
  //       foreignKey: 'eventId',
  //       as: 'Feedback',
  //       onDelete: 'CASCADE',
  //     });
    //   models.Event.hasMany(Feedback, {
    //     as: 'Feedback',
    //     foreignKey: 'eventId',
    //     onDelete: 'CASCADE',
    //   });
    };
  return Feedback;
};
