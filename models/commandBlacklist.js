module.exports = (sequelize, DataTypes) => {
    var commandBlacklist = sequelize.define('commandBlacklist', {
        user_id: DataTypes.TEXT,
        guild_id: DataTypes.TEXT,
        blacklist: {
            type: DataTypes.TEXT,
            defaultValue: '{}'
        }
    });
    return commandBlacklist;
}