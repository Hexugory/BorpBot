module.exports = (sequelize, DataTypes) => {
    var xConfigs = sequelize.define('xConfigs', {
        guild_id: DataTypes.TEXT,
        channel_id: DataTypes.TEXT,
        activityTime: DataTypes.INTEGER,
        activityRatio: DataTypes.FLOAT,
        minimum: DataTypes.INTEGER,
        maximum: DataTypes.INTEGER,
    });
    return xConfigs;
}