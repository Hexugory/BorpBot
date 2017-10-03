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
			Ratelimit of 2 per week.`,
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
		if(msg.client.isOwner(msg.author)){
			return true;
		}
		else{
			return msg.guild.id === "163175631562080256";
		}
	}

	async run(msg, args) {
		function checkCooldown(){
			for(var i = 0; i < cooldownTimes.length+1; i++){
				if(cooldownTimes[i] === undefined){
					return true;
				}
				else if(cooldownTimes[i].id === msg.author.id && cooldownTimes[i].time.isBefore(moment.utc())){
					return true;
				}
				else if(cooldownTimes[i].id === msg.author.id && cooldownTimes[i].time.isAfter(moment.utc())){
					msg.reply(`You cannot use this command again until ${moment.utc(cooldownTimes[i].time).format('MMMM Do YYYY, h:mm:ss a ZZ')}`);
					return false;
				}
			}
		}
		function searchArrayForID(element){
			return element.id === msg.author.id;
		}
		var roles = ["Scarlet Devil Mansion", "Netherworld", "Eientei", "Garden of the Sun", "Youkai Mountain", "Chireiden", "Myourenji", "Senkai", "Shining Needle Castle", "Dream World", "Heaven", "Hell", "Hakurei Shrine", "Forest of Magic", "Human Village", "Outside World"];
		let cooldownTimes = msg.client.provider.get(msg.guild, "cooldownTimes", []);
		if(!roles.includes(args.rn)){
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
					cooldownTimes[IDIndex].time = moment.utc().add(10, "second");
					msg.client.provider.set(msg.guild, "cooldownTimes", cooldownTimes);
				}
				else{
					cooldownTimes.push({time: moment.utc().add(10, "second"), id: msg.author.id});
					msg.client.provider.set(msg.guild, "cooldownTimes", cooldownTimes);
				}
			}
		}
	};
}