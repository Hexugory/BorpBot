const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');
const oneLine = require('common-tags').oneLine;
const moment = require('moment');

module.exports = class GetLocationRoleCommand extends commando.Command {
	constructor(client) {
		super(client, {
			aliases: ['getlocrole'],
			name: 'getlocationrole',
			group: 'role',
			memberName: 'getlocationrole',
			description: oneLine`Get a location color role.
			Use \`'getlocationrole\` with no argument to remove your location role.
			Ratelimit of 1 per week.
			Exclusive to Touhou Project Discord.
			Read #rules for the role list.`,
			examples: ['\'getlocationrole "Scarlet Devil Mansion"', '\'getlocationrole'],
			guildOnly: true,

			args: [
				{
					key: 'rn',
					label: 'role',
					prompt: 'Please enter role.',
					type: 'role',
					default: false
				}
			]
		});
	}
	
	hasPermission(msg) {
		return msg.client.isOwner(msg.author) || (msg.guild && msg.guild.id === "163175631562080256");
	}

	async run(msg, args) {
		var roles = msg.client.provider.get(msg.guild, "locationRoles", []);
		var cooldownTimes = msg.client.provider.get(msg.guild, "cooldownTimes", []);
		var lastUsedIndex = cooldownTimes.findIndex(element => {return element.id === msg.author.id});
		var lastUsed = cooldownTimes[lastUsedIndex];
		if(!args.rn){
			msg.member.roles.set(msg.member.roles.filter(role => {return !roles.includes(role.id)}).array());
			return msg.reply(`Role removed.`);
		}
		else{
			if(!roles.includes(args.rn.id)) return msg.reply("That's not a location role.");
			if(msg.member.roles.get(args.rn.id)) return msg.reply("You already have that role.");
			if(lastUsed && moment.utc().isBefore(lastUsed.time)) return msg.reply(`You cannot use this command again until ${moment.utc(lastUsed.time).format('MMMM Do YYYY, h:mm:ss a ZZ')}, \`${Math.round((parseInt(moment.utc(lastUsed.time).format('x'))-parseInt(moment.utc().format('x')))/1000/60/60)}\` hours from now.`);
			let newRoles = msg.member.roles.filter(role => {return !roles.includes(role.id)}).array();
			newRoles.push(args.rn)
			msg.member.roles.set(newRoles)
			if(lastUsed) cooldownTimes[lastUsedIndex].time = moment.utc().add(1, "week");
			else cooldownTimes.push({time: moment.utc().add(1, "week"), id: msg.author.id});
			msg.client.provider.set(msg.guild, "cooldownTimes", cooldownTimes);
			return msg.reply(`Given role ${args.rn}.`)
		}
	};
}