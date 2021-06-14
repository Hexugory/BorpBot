const Sequelize = require('sequelize');

const db = new Sequelize({
	dialect: 'sqlite',
	storage: './database.sqlite',
	logging: false
});

const customCommands = require('./models/customCommands')(db, Sequelize);
customCommands.sync();

const channelTags = require('./models/channelTags')(db, Sequelize);
channelTags.sync();

const xConfigs = require('./models/xConfigs')(db, Sequelize);
xConfigs.sync();

const blacklistUsers = require('./models/blacklistedUsers')(db, Sequelize);
blacklistUsers.sync();

const commandBlacklist = require('./models/commandBlacklist')(db, Sequelize);
commandBlacklist.sync();

const suggestions = require('./models/suggestions')(db, Sequelize);
suggestions.sync();

const uniqueRoles = require('./models/uniqueRoles')(db, Sequelize);
uniqueRoles.sync();

const reminders = require('./models/reminders')(db, Sequelize);
reminders.sync();

module.exports = {
    db: db,
	customCommands: customCommands,
	channelTags: channelTags,
	xConfigs: xConfigs,
	blacklistUsers: blacklistUsers,
	commandBlacklist: commandBlacklist,
	suggestions: suggestions,
	uniqueRoles: uniqueRoles,
	reminders: reminders
};