module.exports = (sequelize, DataTypes) => {
    var uniqueRoles = sequelize.define('uniqueRoles', {
        guild_id: DataTypes.TEXT,
        role_id: DataTypes.TEXT,
        role_name: DataTypes.TEXT,
        emoji: DataTypes.TEXT,
        description: DataTypes.TEXT,
    });
    return uniqueRoles;
}