module.exports = (sequelize, DataTypes) => {
    const Transition_course = sequelize.define(
      'Transition_course',
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        course: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        duration: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        mentor: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        average_Salary: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        average_Salary_Hike: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        image: {
          type: DataTypes.STRING(1324),
          allowNull: true,
          get() {
            if (this.getDataValue('image'))
              return (
                process.env.DOMAIN_URL +
                'courseImage/' +
                this.getDataValue('image')
              );
          },
        },
        pdf: {
          type: DataTypes.STRING(1324),
          allowNull: true,
          get() {
            if (this.getDataValue('pdf'))
              return (
                process.env.DOMAIN_URL +
                'pdf/' +
                this.getDataValue('pdf')
              );
          },
        },
      },
      {
        timestamps: true,
        freezeTableName: true,
      }
    );
    // (async () => {
    //     if (process.env.ENVIRONMENT !== 'prod') {
    //         await sequelize.sync();
    //     }
    // })();
    return Transition_course;
};