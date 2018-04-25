const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path =  require('path');
const oneLine = require('common-tags').oneLine;

module.exports = class ListNominationsCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'listnominations',
			group: 'suggestion',
			memberName: 'listnominations',
			description: 'Lists nominations.',
			examples: ['\'listnominations'],
			guildOnly: true
		});
	}

	hasPermission(msg) {
		let roles = msg.member.roles.array();
		let permissions = msg.client.provider.get(msg.guild, 'permissions', {suggest:[]});
		if(!permissions.suggest){
			return msg.client.isOwner(msg.author);
		}
		else if(permissions.suggest.length < 1){
			return msg.client.isOwner(msg.author);
		}
		else{
			for(var i = 0; i < roles.length; i++){
				if(permissions.suggest.includes(roles[i].id)){
					return true;
				}
			}
			return msg.client.isOwner(msg.author);
		}
	}

	async run(msg, args) {
		let nominees = this.client.provider.get(msg.guild, 'nominees', {});
		let sendstr = "";
		for(const nominee in nominees){
			sendstr += `[${nominees[nominee].username}]\nNominations: ${nominees[nominee].total}\nInputs:\n`;
			if(!Object.keys(nominees[nominee].inputs).length) sendstr += 'None';
			for(const input in nominees[nominee].inputs){
				sendstr += `${nominees[nominee].inputs[input].username}: ${nominees[nominee].inputs[input].input}\n\n`;
			}
		}
		if(!sendstr) msg.reply("There are no nominations.");
		else if(sendstr.length > 1999){
			let messageBuffer = new Buffer(sendstr, 'utf-8');
			msg.channel.send({files: [{attachment: messageBuffer,name: `result.txt`}]});
		}
		else{
			msg.channel.send(sendstr);
		}
	};
}