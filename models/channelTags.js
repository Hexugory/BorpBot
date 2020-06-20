module.exports = (sequelize, DataTypes) => {
    var channelTags = sequelize.define('channelTags', {
        guild_id: DataTypes.TEXT,
        channel_id: DataTypes.TEXT,
        meme: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        x: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        suggest: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        voice: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        log: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    });
    return channelTags;
}