const commando = require('discord.js-commando');
const sqlite = require('sqlite');
var duelconfig = require('../../duel.json');
for(var i = 0; i < duelconfig.itemmovesets.length; i++){
	duelconfig.types.push({
		name: duelconfig.itemmovesets[i].name,
		max: 1,
		min: 1,
		ordinary: false,
		epic: true,
		legendary: false,
		moveset: true,
		template: `Change your attacks to attacks from ${duelconfig.itemmovesets[i].name}.`
	})
}

module.exports = class ListItemsCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'listitems',
			group: 'meme',
			memberName: 'listitems',
			description: 'List duel items.',
			examples: ['\'listitems'],
			guildOnly: true
		});
	}
	

	async run(msg, args) {
		function createStringFromTemplate(template, variables) {
			return template.replace(new RegExp("\{([^\{]+)\}", "g"), function(_unused, varName){
				return variables[varName];
			});
		}
		function createDescString(item){
			if(!item){
				return "None";
			}
			else{
				if(item.template){
					return `${item.quality} quality: ${createStringFromTemplate(item.template, {mag: item.mag})}`;
				}
				else{
					return `${item.quality} quality: ${createStringFromTemplate(duelconfig.types.find(element => {return element.name === item.type}).template, {mag: item.mag})}`;
				}
			}
		}
		let itemssend = "```diff\n- Equipped items -\n";
		let duelstats = msg.client.provider.get(msg.guild, "duelstats", {});
		if(!duelstats[msg.author.id]){
			return msg.reply("```diff\n- You have no items or equipped items -```")
		}
		else{
			for(var i = 0; i < duelstats[msg.author.id].equipped.length; i++){
				itemssend += `+ Slot ${i+1}: ${createDescString(duelstats[msg.author.id].equipped[i])}\n`;
			};
			if(duelstats[msg.author.id].moveset){
				itemssend += `+ Slot 4 (Moveset): ${createDescString(duelstats[msg.author.id].moveset)}`
			}
			else{
				itemssend += `+ Slot 4 (Moveset): Default (Touhou)`
			}
			itemssend += '```\n```diff\n- Unequipped items -\n'
			for(var i = 0; i < duelstats[msg.author.id].items.length; i++){
				itemssend += `+ Index ${i}: ${createDescString(duelstats[msg.author.id].items[i])}\n`;
			};
			itemssend += '```'
			if(itemssend.length > 1999){
				let itemsBuffer = new Buffer(itemssend, 'utf-8');
				return msg.channel.send({files: [{attachment: itemsBuffer,name: `items.txt`}]});
			}
			else{
				return msg.reply(itemssend)
			}
		}
	}
};
