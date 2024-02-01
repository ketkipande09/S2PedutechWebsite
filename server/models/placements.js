const { OPTIONS, generateURl } = require('../config/options/global.options');

module.exports = (sequelize, DataTypes) => {
    const Placement = sequelize.define(
        "Placement",
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
            college: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            company: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            image: {
                type: DataTypes.STRING(1324),
                allowNull: true,
                get() {
                    if (this.getDataValue("image"))
                        return (
                            process.env.DOMAIN_URL +
                            "placement/" +
                            this.getDataValue("image")
                        );
                },
            },
        
        },
        {
            timestamps: true,
            freezeTableName: true,
        }
    );



    return Placement;
};