module.exports = (sequelize, DataTypes) => {
    var toggleRoles = sequelize.define('toggleRoles', {
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
        }
    });
    return toggleRoles;
}