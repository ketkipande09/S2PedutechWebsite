const { OPTIONS, generateURl } = require('../config/options/global.options');

module.exports = (sequelize, DataTypes) => {
    const Slider = sequelize.define(
        "Client",
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
            image: {
                type: DataTypes.STRING(1324),
                allowNull: true,
                get() {
                    if (this.getDataValue("image"))
                        return (
                            process.env.DOMAIN_URL +
                            "client/" +
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
    
    

    return Slider;
};