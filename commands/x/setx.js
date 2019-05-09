const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');

module.exports = class xLimitCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'setx',
			group: 'x',
			memberName: 'setx',
			description: 'Set the variables related to calculating the required x count for the channel. (Manage Messages)',
			examples: ['\'setx 5'],
			guildOnly: true,

			args: [
				{
					key: 'xActivityTime',
					label: 'time to look back (in milliseconds)',
					prompt: 'Specify the time to look back (in milliseconds). (Default 1200000)',
					type: 'integer',
					validate: arg => {
						return 60000 <= arg <= 3600000;
					}
				},
				{
					key: 'xEmbedTime',
					label: 'time to look back for embeds (in milliseconds)',
					prompt: 'Specify the time to look back for embeds (in milliseconds). (Default 5000)',
					type: 'integer',
					validate: arg => {
						return 1000 <= arg <= 60000;
					}
				},
				{
					key: 'xActivityRatio',
					label: 'amount to multiply unique users by',
					prompt: 'Specify the amount to multiply unique users by. (Default 0.25)',
					type: 'float',
					validate: arg => {
						return 0.1 <= arg <= 1;
					}
				},
				{
					key: 'xEmbedPenalty',
					label: 'amount to lower the x limit for recently posted embeds',
					prompt: 'Specify the amount to lower the x limit for recently posted embeds. (Default 2)',
					type: 'integer',
					validate: arg => {
						return 0 <= arg <= 100;
					}
				},
				{
					key: 'xMin',
					label: 'minimum x count',
					prompt: 'Specify the minimum x count. (Default 1)',
					type: 'integer',
					validate: arg => {
						return 1 <= arg <= 100;
					}
				},
				{
					key: 'xMax',
					label: 'maximum x count',
					prompt: 'Specify the maximum x count. (Default 30)',
					type: 'integer',
					validate: arg => {
						return 2 <= arg <= 100;
					}
				}
			]
		});
	}
	
	hasPermission(msg) {
		return msg.client.isOwner(msg.author) || (msg.guild && msg.member.permissions.has('MANAGE_MESSAGES'))
	}

	async run(msg, args) {
		msg.client.provider.set(msg.guild, 'xActivityTime'+msg.channel.id, args.xActivityTime);
		msg.client.provider.set(msg.guild, 'xEmbedTime'+msg.channel.id, args.xEmbedTime);
		msg.client.provider.set(msg.guild, 'xActivityRatio'+msg.channel.id, args.xActivityRatio);
		msg.client.provider.set(msg.guild, 'xEmbedPenalty'+msg.channel.id, args.xEmbedPenalty);
		msg.client.provider.set(msg.guild, 'xMin'+msg.channel.id, args.xMin);
		msg.client.provider.set(msg.guild, 'xMax'+msg.channel.id, args.xMax);
		return msg.reply(`xActivityTime set to ${args.xActivityTime}
xEmbedTime set to ${args.xEmbedTime}
xActivityRatio set to ${args.xActivityRatio}
xEmbedPenalty set to ${args.xEmbedPenalty}
xMin set to ${args.xMin}
xMax set to ${args.xMax}`);
	};
}