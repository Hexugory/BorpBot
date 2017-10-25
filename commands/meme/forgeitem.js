const commando = require('discord.js-commando');
const sqlite = require('sqlite');
var duelconfig = require('../../duel.json');

module.exports = class ForgeItemCommand extends commando.Command {
	constructor(client) {
		super(client, {
			aliases: ['forge'],
			name: 'forgeitem',
			group: 'meme',
			memberName: 'forgeitem',
			description: 'Forge an item out of Borpdust. 1,000 for Ordinary, 5,000 for Epic, 20,000 for Legendary.',
			examples: ['\'forgeitem legendary'],
			guildOnly: true,
			
			args: [
				{
					key: 'qu',
					label: 'quality',
					prompt: 'Specify quality.',
					type: 'string'
				}
			]
		});
	}

	async run(msg, args) {
		function ucFirst(string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		}
		function getRandomInt(min, max){
			return Math.floor(Math.random() * (max - min + 1) + min);
		}
		
		function generateNewItem(){
			let item = {};
			item.quality = ['Ordinary', 'Epic', 'Legendary'].includes(ucFirst(args.qu)) ? ucFirst(args.qu) : 'Ordinary';
			let types = duelconfig.types;
			for(var i = 0; i < duelconfig.itemmovesets.length; i++){
				types.push({
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
			let filteredtypes = types.filter(function(element){return element[item.quality.toLowerCase()]})
			let type = filteredtypes[getRandomInt(0,filteredtypes.length-1)];
			item.type = type.name;
			item.template = type.template;
			if(type.moveset){
				item.moveset = type.moveset;
			}
			item.mag = item.quality === "Legendary" ? getRandomInt(type.max*2+1,type.max*3) : (item.quality === "Epic" ? getRandomInt(type.max+1,type.max*2) : getRandomInt(type.min,type.max));
			return item;
		}
		
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
				return `${item.quality} quality: ${createStringFromTemplate(item.template, {mag: item.mag})}`;
			}
		}
		let duelstats = msg.client.provider.get(msg.guild, "duelstats" + msg.author.id, null);
		if(duelstats){
			if(!duelstats.borpdust || duelstats.borpdust < (ucFirst(args.qu) === "Legendary" ? 20000 : (ucFirst(args.qu) === "Epic" ? 5000 : 1000))){
				return msg.reply("```diff\n- You don't have enough Borpdust -```")
			}
			else{
				duelstats.borpdust -= ucFirst(args.qu) === "Legendary" ? 20000 : (ucFirst(args.qu) === "Epic" ? 5000 : 1000)
				duelstats.items.push(generateNewItem());
				msg.client.provider.set(msg.guild, "duelstats" + msg.author.id, duelstats);
				msg.reply(`\`\`\`diff\n! You forged: ${createDescString(duelstats.items[duelstats.items.length-1])} !\`\`\``);
			}
		}
		else{
			return msg.reply("```diff\n- You don't have enough Borpdust -```")
		}
	}
};
