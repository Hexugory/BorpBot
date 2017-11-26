const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');
const oneLine = require('common-tags').oneLine;

module.exports = class SetRoleCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'setrole',
			group: 'mod',
			memberName: 'setrole',
			description: oneLine`
            Allow a role to use a specific set of commands.
            "mod" to allow moderative commands (excluding this one).
            "suggest" to allow suggestion managing commands (all of the suggest commands excluding "suggest" itself).
            "custom" to alllow custom command managing commands (all of the custom command commands excluding newcommand, custom, and undo).`,
			examples: ['\'setrole mod Moderator'],
			guildOnly: true,

			args: [
				{
					key: 'pr',
					label: 'permission',
					prompt: 'Specify permission.',
					type: 'string'
				},
				{
					key: 'rl',
					label: 'role',
					prompt: 'Specify role.',
					type: 'role'
				}
			]
		});
	}
	
	hasPermission(msg) {
		return msg.client.isOwner(msg.author) || (msg.member && msg.member.permissions.has('MANAGE_ROLES'));
	}

	async run(msg, args) {
		//check for a valid argument
		if(['mod', 'custom', 'suggest'].includes(args.pr)){
			var perms = this.client.provider.get(msg.guild, 'permissions', {});
			if(!Array.isArray(perms[args.pr])){
				perms[args.pr] = [];
			}
            //check if the target isnt already in the list
            if(!perms[args.pr].includes(args.rl.id)){
                perms[args.pr].push(args.rl.id);
                this.client.provider.set(msg.guild, 'permissions', perms);
                return msg.channel.send(`${args.rl.name} added to **${args.pr}**.`);
            }
            else{
                perms[args.pr].splice(perms[args.pr].indexOf(args.rl.id), 1);
                this.client.provider.set(msg.guild, 'permissions', perms);
                return msg.channel.send(`${args.rl.name} removed from **${args.pr}**.`);
            }
		}
		else{
			return msg.channel.send(`**${args.pr}** does not exist.`);
		}
	};
}