const commando = require('discord.js-commando');
const sqlite = require('sqlite');

module.exports = class GrantItemCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'grantitem',
			group: 'meme',
			memberName: 'grantitem',
			description: 'Grant somebody an item. (Bot Owner)',
			examples: ['\'grantitem Guy Hero'],
			guildOnly: true,
			
			args: [
				{
					key: 'member',
					label: 'member',
					prompt: 'Specify member.',
					type: 'member'
				}
			]
		});
	}
	
	hasPermission(msg) {
		return this.client.isOwner(msg.author);
	}

	async run(msg, args) {
		var types = [
			{name: "damage", max: 15, min: 5, improvable: true, template: "Increase damage dealt by {mag}%."},
			{name: "drain", max: 15, min: 5, improvable: true, template: "Heal yourself for {mag}% of all damage you deal."},
			{name: "defense", max: 15, min: 5, improvable: true, template: "Decrease damage taken by {mag}%."},
			{name: "extraturn", max: 5, min: 1, improvable: true, template: "{mag}% chance to take an extra turn."},
			{name: "healsteal", max: 1, min: 1, improvable: false, template: "Steal all healing done by the enemy (before modifiers)."},
			{name: "doubledamage", max: 20, min: 5, improvable: false, template: "{mag}% chance to double damage dealt."},
			{name: "halfdamage", max: 20, min: 5, improvable: false, template: "{mag}% chance to halve damage taken."}
		]
		
		function getRandomInt(min, max){
			return Math.floor(Math.random() * (max - min + 1) + min);
		}
		
		function generateNewItem(){
			let item = {};
			let type = types[getRandomInt(0,types.length-1)];
			item.type = type.name;
			if(type.improvable){
				item.quality = getRandomInt(0, 100) > 90 ? (getRandomInt(0, 100) > 90 ? "Legendary" : "Epic") : "Ordinary";
				item.mag = item.quality === "Legendary" ? getRandomInt(type.max*2,type.max*3) : item.quality === "Epic" ? getRandomInt(type.max,type.max*2) : getRandomInt(type.min,type.max);
			}
			else{
				item.quality = "Ordinary";
				item.mag = getRandomInt(type.min,type.max);
			}
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
		let duelstats = msg.client.provider.get(msg.guild, "duelstats" + args.member.user.id, null);
		if(duelstats){
			duelstats.items.push(generateNewItem());
			msg.client.provider.set(msg.guild, "duelstats" + args.member.user.id, duelstats);
		}
		else{
			duelstats = {items: [generateNewItem()], equipped: [null, null, null]};
			msg.client.provider.set(msg.guild, "duelstats" + args.member.user.id, duelstats);
		}
		if(msg.client.provider.get(msg.guild, 'optlist', []).includes(args.member.user.id)){
			args.member.user.send(`You have gained an item: ${createDescString(duelstats.items[duelstats.items.length-1])}`)
		}
	}
};
