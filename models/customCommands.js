module.exports = (sequelize, DataTypes) => {
    var customCommands = sequelize.define('customCommands', {
        guild_id: DataTypes.TEXT,
        name: DataTypes.STRING(32),
        response: DataTypes.TEXT
    });
    return customCommands;
}