const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');
const oneLine = require('common-tags').oneLine;

module.exports = class LeaderboardCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'leaderboard',
			group: 'meme',
			memberName: 'leaderboard',
			description: 'Shows the specified leaderboard.',
			details: oneLine`
			tumbleweed leaderboard and duel or smth
			`,
			examples: ['\'leaderboard tumbleweed'],
			guildOnly: true,

			args: [
				{
					key: 'lb',
					label: 'lb',
					prompt: 'What leaderboard?',
					type: 'string'
				}
			]
		});
	}
	

	async run(msg, args) {

		//check for a valid argument
		if(['tumbleweed', 'duel'].includes(args.lb)){
			var scorenames = {
				tumbleweed: 'Minutes',
				duel: 'Wins'
			};
			let list = this.client.provider.get(msg.guild, args.lb + 'Leaderboard', []);
			if(list[0] === undefined){
				return msg.channel.send('This leaderboard is empty.');
			}
			else{
				list = await list.sort(function(a, b) {
					return a.score - b.score;
				}).reverse();
				if(list.length > 10){
					list.length = 10;
				};
				let send = '```';
				for(var i = 0; i < list.length; i++){
					send += `${i>0 ? list[i].score === list[i-1].score ? i : i+1 : i+1}. ${list[i].username}: ${list[i].score} ${scorenames[args.lb]}\n`
				}
				this.client.provider.set(msg.guild, 'tumbleweedLeaderboard', list);
				return msg.channel.send(send + '```');
			}
		}
	}
};
