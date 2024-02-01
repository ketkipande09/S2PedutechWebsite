module.exports = (sequelize, DataTypes) => {
    const Image = sequelize.define("Image",
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            type: {
                type: DataTypes.STRING,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            data: {
                type: DataTypes.BLOB("long"),
                allowNull: false,
                get() {
                    return this.getDataValue('data').toString('utf8');
                },
            },
        }
    );
    // (async () => {
    //     if (process.env.ENVIRONMENT !== 'prod') {
    //         await sequelize.sync();
    //     }
    // })();
    return Image;
};