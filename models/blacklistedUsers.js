module.exports = (sequelize, DataTypes) => {
    var blacklistUsers = sequelize.define('blacklistUsers', {
        user_id: DataTypes.TEXT,
        blacklisted: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    });
    return blacklistUsers;
}