import { DataTypes, Sequelize } from "sequelize";
import { BlacklistUsers } from "./models/blacklistusers";
import { ChannelTags } from "./models/channeltags";
import { CommandBlacklist } from "./models/commandblacklist";
import { Reminders } from "./models/reminders";
import { Suggestions } from "./models/suggestions";
import { ToggleRoles } from "./models/toggleroles";
import { UniqueRoles } from "./models/uniqueroles";
import { XConfigs } from "./models/xconfigs";

export const db = new Sequelize({
	dialect: 'sqlite',
	storage: './database.sqlite',
	logging: false
});

BlacklistUsers.init({
    user_id: {
        type: DataTypes.TEXT,
        primaryKey: true
    }
},
{
    tableName: 'BlacklistUsers',
    sequelize: db
});

ChannelTags.init({
    channel_id: {
        type: DataTypes.TEXT,
        primaryKey: true
    },
    guild_id: DataTypes.TEXT,
    meme: DataTypes.BOOLEAN,
    x: DataTypes.BOOLEAN,
    suggest: DataTypes.BOOLEAN,
    voice: DataTypes.BOOLEAN,
    log: DataTypes.BOOLEAN
},
{
    tableName: 'ChannelTags',
    sequelize: db
});

CommandBlacklist.init({
    user_id: DataTypes.TEXT,
    guild_id: DataTypes.TEXT,
    blacklist: {
        type: DataTypes.TEXT,
        defaultValue: '{}'
    }
},
{
    tableName: 'CommandBlacklist',
    sequelize: db
});

Reminders.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: DataTypes.TEXT,
    time: DataTypes.DATE,
    reminder: DataTypes.TEXT
},
{
    tableName: 'Reminders',
    sequelize: db
});

Suggestions.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    guild_id: DataTypes.TEXT,
    user_id: DataTypes.TEXT,
    anonymous: DataTypes.BOOLEAN,
    suggestion: DataTypes.TEXT
},
{
    tableName: 'Suggestions',
    sequelize: db
});

ToggleRoles.init({
    role_id: {
        type: DataTypes.TEXT,
        primaryKey: true
    },
    guild_id: DataTypes.TEXT,
    role_name: DataTypes.TEXT
},
{
    tableName: 'ToggleRoles',
    sequelize: db
});

UniqueRoles.init({
    role_id: {
        type: DataTypes.TEXT,
        primaryKey: true
    },
    guild_id: DataTypes.TEXT,
    role_name: DataTypes.TEXT,
    emoji: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
},
{
    tableName: 'UniqueRoles',
    sequelize: db
});

XConfigs.init({
    channel_id: {
        type: DataTypes.TEXT,
        primaryKey: true
    },
    activity_time: DataTypes.INTEGER,
    activity_ratio: DataTypes.FLOAT,
    minimum: DataTypes.INTEGER,
    maximum: DataTypes.INTEGER
},
{
    tableName: 'XConfigs',
    sequelize: db
});

(async () => {
    await db.sync();
})();
