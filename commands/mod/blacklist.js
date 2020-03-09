const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');
const oneLine = require('common-tags').oneLine;

module.exports = class BlacklistCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'blacklist',
			group: 'mod',
			memberName: 'blacklist',
			description: oneLine`Prevents a user from using a specific set of commands.
			A command or a command group can be specified.
			You can also blacklist them from all commands in the server with "server".
			Requires mod permission. (See setrole)`,
			examples: ['\'blacklist x @Guy Hero#1823'],
			guildOnly: true,

			args: [
				{
					key: 'bc',
					label: 'bc',
					prompt: 'Specify blacklist.',
					type: 'string'
				},
				{
					key: 'user',
					label: 'mention',
					prompt: 'Specify user.',
					type: 'user',
					infinite: true
				}
			]
		});
	}
	
	hasPermission(msg) {
		let roles = msg.member.roles.cache.array();
		let permissions = msg.client.provider.get(msg.guild, 'permissions', {mod:[]});
		if(!permissions.mod){
			return msg.client.isOwner(msg.author);
		}
		else if(permissions.mod.length < 1){
			return msg.client.isOwner(msg.author);
		}
		else{
			for(var i = 0; i < roles.length; i++){
				if(permissions.mod.includes(roles[i].id)){
					return true;
				}
			}
			return msg.client.isOwner(msg.author);
		}
	}

	async run(msg, args) {
		//check for a valid argument
		var command = msg.client.registry.findCommands(args.bc, true)[0]
		var group = msg.client.registry.findGroups(args.bc, true)[0]
		if(!['server'].includes(args.bc) && !command && !group) return msg.channel.send(`**${blacklistName}** blacklist does not exist.`);
		var blacklistName;
		command ? blacklistName = command.name : null;
		group ? blacklistName = group.name : null;
		['server'].includes(args.bc) ? blacklistName = 'server' : null;
		var list = this.client.provider.get(msg.guild, 'blacklist', {});
		if(!Array.isArray(list[blacklistName])) list[blacklistName] = [];
		var sendstr = "\n";
		for(let user of args.user){
			if(!list[blacklistName].includes(user.id)){
				list[blacklistName].push(user.id);
				this.client.provider.set(msg.guild, 'blacklist', list);
				sendstr += `${user}: added to **${blacklistName}**\n`
			}
			else{
				list[blacklistName].splice(list[blacklistName].indexOf(user.id), 1);
				this.client.provider.set(msg.guild, 'blacklist', list);
				sendstr += `${user}: removed from **${blacklistName}**\n`
			}
		}
		if(sendstr.length > 1999){
			var messageBuffer = new Buffer(sendstr, 'utf-8')
			return msg.reply({files: [{attachment: messageBuffer,name: `result.txt`}]})
		}
		else{
			return msg.reply(sendstr)
		}
	};
}