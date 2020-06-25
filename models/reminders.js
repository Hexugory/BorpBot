module.exports = (sequelize, DataTypes) => {
    var reminders = sequelize.define('reminders', {
        sender_id: DataTypes.TEXT,
        time: DataTypes.DATE,
        reminder: DataTypes.TEXT
    });
    return reminders;
}