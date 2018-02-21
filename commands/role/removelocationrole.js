const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');
const oneLine = require('common-tags').oneLine;
const moment = require('moment');

module.exports = class RemoveLocationRoleCommand extends commando.Command {
	constructor(client) {
		super(client, {
			aliases: ['removelocrole'],
			name: 'removelocationrole',
			group: 'role',
			memberName: 'removelocationrole',
			description: oneLine`Remove location color roles from the role list.
			Exclusive to Touhou Discord.`,
			examples: ['\'removelocationrole "Scarlet Devil Mansion" "Lunar Capital"'],
			guildOnly: true,

			args: [
				{
					key: 'rn',
					label: 'role',
					prompt: 'Please enter roles.',
					type: 'role',
					infinite: true
				}
			]
		});
	}
	
	hasPermission(msg) {
		return msg.client.isOwner(msg.author)
		|| (msg.guild && msg.guild.id === "163175631562080256"
		&& msg.member.permissions.has("MANAGE_ROLES"));
	}

	async run(msg, args) {
		var roles = msg.client.provider.get(msg.guild, "locationRoles", []);
		var sendstr = "";
		for(var i = 0; i < args.rn.length; i++){
			var roleIndex = roles.indexOf(args.rn[i].id);
			if(roleIndex < 0){
				sendstr += `${args.rn[i].name}: Role not in list.\n`;
			}
			else{
				roles.splice(roleIndex, 1);
				sendstr += `${args.rn[i].name}: 👍\n`;
			}
		}
		msg.client.provider.set(msg.guild, "locationRoles", roles);
		if(sendstr.length > 1999){
			let sendBuffer = new Buffer(sendstr, 'utf-8');
			return msg.channel.send({files: [{attachment: itemsBuffer,name: `msg.txt`}]});
		}
		else{
			return msg.reply(sendstr)
		}
	};
}