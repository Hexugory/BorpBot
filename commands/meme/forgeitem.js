const commando = require('discord.js-commando');
const sqlite = require('sqlite');

module.exports = class ForgeItemCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'forgeitem',
			group: 'meme',
			memberName: 'forgeitem',
			description: 'Forge an item out of Borpdust. 1,000 for Ordinary, 10,000 for Epic, 40,000 for Legendary.',
			examples: ['\'grantitem Guy Hero'],
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
		var types = [
			{name: "damage", max: 20, min: 5, ordinary: true, epic: true, legendary: true, template: "Increase damage dealt by {mag}%."},
			{name: "drain", max: 15, min: 5, ordinary: true, epic: true, legendary: true, template: "Heal yourself for {mag}% of all damage you deal."},
			{name: "defense", max: 15, min: 5, ordinary: true, epic: true, legendary: true, template: "Decrease damage taken by {mag}%."},
			{name: "extraturn", max: 7, min: 1, ordinary: true, epic: true, legendary: true, template: "{mag}% chance to take an extra turn."},
			{name: "healsteal", max: 1, min: 1, ordinary: true, epic: false, legendary: false, template: "Steal all healing done by the enemy (before modifiers)."},
			{name: "healsteallegendary", max: 1, min: 1, ordinary: false, epic: false, legendary: true, template: "Steal all healing done by the enemy (after modifiers)."},
			{name: "doubledamage", max: 20, min: 5, ordinary: true, epic: false, legendary: false, template: "{mag}% chance to double damage dealt."},
			{name: "halfdamage", max: 20, min: 5, ordinary: true, epic: false, legendary: false, template: "{mag}% chance to halve damage taken."},
			{name: "skipcooldown", max: 5, min: 5, ordinary: false, epic: false, legendary: true, template: "{mag}% chance to skip your fight cooldown when you lose."}
		]
		
		function getRandomInt(min, max){
			return Math.floor(Math.random() * (max - min + 1) + min);
		}
		
		function generateNewItem(){
			let item = {};
			item.quality = ['Ordinary', 'Epic', 'Legendary'].includes(ucFirst(args.qu)) ? ucFirst(args.qu) : 'Ordinary';
			let filteredtypes = types.filter(function(element){return element[item.quality.toLowerCase()]})
			let type = filteredtypes[getRandomInt(0,filteredtypes.length-1)];
			item.type = type.name;
			item.template = type.template;
			item.mag = item.quality === "Legendary" ? getRandomInt(type.max*2,type.max*3) : (item.quality === "Epic" ? getRandomInt(type.max,type.max*2) : getRandomInt(type.min,type.max));
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
				item.template = types.find(function(element){return element.name === item.type}).template;
				return `${item.quality} quality: ${createStringFromTemplate(item.template, {mag: item.mag})}`;
			}
		}
		let duelstats = msg.client.provider.get(msg.guild, "duelstats" + msg.author.id, null);
		if(duelstats){
			console.log(!duelstats.borpdust, duelstats.borpdust < (ucFirst(args.qu) === "Legendary" ? 40000 : (ucFirst(args.qu) === "Epic" ? 10000 : 1000)))
			if(!duelstats.borpdust || duelstats.borpdust < (ucFirst(args.qu) === "Legendary" ? 40000 : (ucFirst(args.qu) === "Epic" ? 10000 : 1000))){
				return msg.reply("```diff\n- You don't have enough Borpdust -```")
			}
			else{
				duelstats.borpdust -= ucFirst(args.qu) === "Legendary" ? 40000 : (ucFirst(args.qu) === "Epic" ? 10000 : 1000)
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
