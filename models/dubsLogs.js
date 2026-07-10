module.exports = (sequelize, DataTypes) => {
    var dubsLogs = sequelize.define('dubsLogs', {
        user_id: DataTypes.TEXT,
        roll: DataTypes.INTEGER,
        score: DataTypes.INTEGER
    });
    return dubsLogs;
}