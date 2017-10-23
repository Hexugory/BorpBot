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
			Ratelimit of 1 per week.
			Exclusive to Touhou Discord.
			Roles: https://i.imgur.com/S7Q1JLW.png`,
			examples: ['\'getlocationrole "Scarlet Devil Mansion"'],

			args: [
				{
					key: 'rn',
					label: 'role name',
					prompt: 'Please enter role name.',
					type: 'string'
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
		var roles = ["Scarlet Devil Mansion", "Netherworld", "Eientei", "Garden of the Sun", "Youkai Mountain", "Chireiden", "Myourenji", "Senkai", "Shining Needle Castle", "Dream World", "Heaven", "Hell", "Hakurei Shrine", "Forest of Magic", "Human Village", "Outside World", "Makai", "Moriya Shrine", "Lunar Capital"];
		let cooldownTimes = msg.client.provider.get(msg.guild, "cooldownTimes", []);
		if(args.rn === "none"){
			for(var i = 0; i < roles.length; i++){
				let foundLocationRole = msg.member.roles.find("name", roles[i]);
				if(foundLocationRole){
					msg.reply(`Role removed.`);
					msg.member.removeRole(foundLocationRole, "Removed location roles");
				}
			}
		}
		else if(!roles.includes(args.rn)){
			msg.reply("That's not a location role.");
		}
		else{
			if(checkCooldown()){
				for(var i = 0; i < roles.length; i++){
					let foundLocationRole = msg.member.roles.find("name", roles[i]);
					if(foundLocationRole && foundLocationRole.name != args.rn){
						msg.member.removeRole(foundLocationRole, "Requested new location role");
					}
				}
				msg.member.addRole(msg.guild.roles.find("name", args.rn), "Requested location role");
				msg.reply(`Given role ${args.rn}.`)
				let IDIndex = cooldownTimes.findIndex(searchArrayForID);
				if(IDIndex>-1){
					cooldownTimes[IDIndex].time = moment.utc().add(1, "week");
					msg.client.provider.set(msg.guild, "cooldownTimes", cooldownTimes);
				}
				else{
					cooldownTimes.push({time: moment.utc().add(1, "week"), id: msg.author.id});
					msg.client.provider.set(msg.guild, "cooldownTimes", cooldownTimes);
				}
			}
		}
	};
}