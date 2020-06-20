module.exports = (sequelize, DataTypes) => {
    var uniqueRoles = sequelize.define('uniqueRoles', {
        guild_id: DataTypes.TEXT,
        role_id: DataTypes.TEXT
    });
    return uniqueRoles;
}