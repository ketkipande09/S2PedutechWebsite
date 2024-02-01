

const { OPTIONS, generateURl } = require('../config/options/global.options');


module.exports = (sequelize, DataTypes) => {
  const Enquiry = sequelize.define("Enquiry", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mobile: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    college: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    branch: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    passingyear: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    course: {
      type: DataTypes.STRING,
      allowNull: false,
    },
   
  },
    {
      timestamps: true,
      freezeTableName: true,
    });

  return Enquiry;
};
  
