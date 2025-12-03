module.exports = (sequelize, DataTypes) => {
    var dubsLogs = sequelize.define('dubsLogs', {
        user_id: DataTypes.TEXT,
        roll: DataTypes.INTEGER
    });
    return dubsLogs;
}