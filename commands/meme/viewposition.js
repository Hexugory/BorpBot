const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');
const oneLine = require('common-tags').oneLine;

module.exports = class ViewPositionCommand extends commando.Command {
	constructor(client) {
		super(client, {
			aliases: ['viewpos', 'vposition', 'vpos'],
			name: 'viewposition',
			group: 'meme',
			memberName: 'viewposition',
			description: oneLine`Shows the user's position on the specified leaderboard.
			"tumbleweed" for the tumbleweed leaderboard,
			"wins" for rankedduel wins,
			"rank" for rankedduel rank.`,
			examples: ['\'viewposition @Guy Hero#1823 tumbleweed'],
			guildOnly: true,

			args: [
				{
					key: 'mb',
					label: 'member',
					prompt: 'What member?',
					type: 'member'
				},
				{
					key: 'lb',
					label: 'leaderboard',
					prompt: 'What leaderboard?',
					type: 'string'
				}
			]
		});
	}
	

	async run(msg, args) {

		//check for a valid argument
		if(['tumbleweed', 'wins', 'rank'].includes(args.lb)){
			var scorenames = {
				tumbleweed: 'Minutes',
				wins: 'Wins',
				rank: 'Rank'
			};
			let list = this.client.provider.get(msg.guild, args.lb + 'Leaderboard', []);
			if(list[0] === undefined){
				return msg.channel.send('This leaderboard is empty.');
			}
			else{
				list = await list.sort(function(a, b) {
					return a.score - b.score;
				}).reverse();
				let send = '```';
				let memberIndex = list.findIndex(function(element){return element.id === args.mb.id});
				if(memberIndex > -1){
					for(var i = 0; i < list.length; i++){
						list[i].position = i>0 ? list[i].score === list[i-1].score ? list[i].position = list[i-1].position : list[i].position = i+1 : list[i].position = i+1;
					}
					send += `${list[memberIndex].position}. ${list[memberIndex].username}: ${list[memberIndex].score} ${scorenames[args.lb]}\n`
					return msg.channel.send(send + '```');
				}
				else{
					return msg.reply('This person is not on that leaderboard.');
				}
			}
		}
	}
};
