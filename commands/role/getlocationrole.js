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
			Use \`'getlocationrole\` to remove your location role.
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
					default: 'none'
				}
			]
		});
	}
	
	hasPermission(msg) {
		return msg.client.isOwner(msg.author) || (msg.guild && msg.guild.id === "163175631562080256");
	}

	async run(msg, args) {
		function checkCooldown(){
			for(var i = 0; i < cooldownTimes.length+1; i++){
				if(cooldownTimes[i] === undefined){
					return true;
				}
				else if(cooldownTimes[i].id === msg.author.id && moment.utc().isAfter(cooldownTimes[i].time)){
					return true;
				}
				else if(cooldownTimes[i].id === msg.author.id && moment.utc().isBefore(cooldownTimes[i].time)){
					msg.reply(`You cannot use this command again until ${moment.utc(cooldownTimes[i].time).format('MMMM Do YYYY, h:mm:ss a ZZ')}, one week from when you used the command last.`);
					return false;
				}
			}
		}
		function searchArrayForID(element){
			return element.id === msg.author.id;
		}
		var roles = msg.client.provider.get(msg.guild, "locationRoles", []);
		var cooldownTimes = msg.client.provider.get(msg.guild, "cooldownTimes", []);
		if(args.rn === "none"){
			for(var i = 0; i < roles.length; i++){
				let foundLocationRole = msg.member.roles.get(roles[i]);
				if(foundLocationRole) msg.member.roles.remove(foundLocationRole, "Requested new location role");
			}
			return msg.reply(`Role removed.`);
		}
		else{
			if(checkCooldown()){
				if(roles.includes(args.rn.id)){
					let newRoles = msg.member.roles.filter(role => {return !roles.includes(role.id)}).array()
					newRoles.push(args.rn)
					msg.member.roles.set(newRoles)
					var IDIndex = cooldownTimes.findIndex(searchArrayForID);
					if(IDIndex>-1){
						cooldownTimes[IDIndex].time = moment.utc().add(1, "week");
						msg.client.provider.set(msg.guild, "cooldownTimes", cooldownTimes);
					}
					else{
						cooldownTimes.push({time: moment.utc().add(1, "week"), id: msg.author.id});
						msg.client.provider.set(msg.guild, "cooldownTimes", cooldownTimes);
					}
					return msg.reply(`Given role ${args.rn}.`)
				}
				else{
					return msg.reply(`That's not a location role.`)
				}
			}
		}
	};
}