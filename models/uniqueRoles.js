module.exports = (sequelize, DataTypes) => {
    var uniqueRoles = sequelize.define('uniqueRoles', {
        guild_id: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        role_id: {
            type: DataTypes.TEXT,
            allowNull: false,
            unique: true
        },
        role_name: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        emoji: DataTypes.TEXT,
        description: DataTypes.TEXT,
    });
    return uniqueRoles;
}