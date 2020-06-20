module.exports = (sequelize, DataTypes) => {
    var suggestions = sequelize.define('suggestions', {
        guild_id: DataTypes.TEXT,
        sender_id: DataTypes.TEXT,
        anonymous: DataTypes.INTEGER,
        suggestion: DataTypes.TEXT
    });
    return suggestions;
}