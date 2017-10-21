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
				},
				{
					key: 'qu',
					label: 'quality',
					prompt: 'Specify quality.',
					type: 'string'
				},
				{
					key: 'ty',
					label: 'type',
					prompt: 'Specify type.',
					type: 'string'
				}
			]
		});
	}
	
	hasPermission(msg) {
		return this.client.isOwner(msg.author) || msg.guild.owner.id === msg.author.id;
	}

	async run(msg, args) {
		var types = [
			{name: "damage", max: 30, min: 5, ordinary: true, epic: true, legendary: true, template: "Increase damage dealt by {mag}%."},
			{name: "drain", max: 15, min: 5, ordinary: true, epic: true, legendary: true, template: "Heal yourself for {mag}% of all damage you deal."},
			{name: "defense", max: 15, min: 5, ordinary: true, epic: true, legendary: true, template: "Decrease damage taken by {mag}%."},
			{name: "extraturn", max: 10, min: 1, ordinary: true, epic: true, legendary: true, template: "{mag}% chance to take an extra turn."},
			{name: "healsteal", max: 1, min: 1, ordinary: true, epic: false, legendary: false, template: "Steal all healing done by the enemy (before modifiers)."},
			{name: "healsteallegendary", max: 1, min: 1, ordinary: false, epic: false, legendary: true, template: "Steal all healing done by the enemy (after modifiers)."},
			{name: "doubledamage", max: 30, min: 5, ordinary: true, epic: false, legendary: false, template: "{mag}% chance to double damage dealt."},
			{name: "halfdamage", max: 20, min: 5, ordinary: true, epic: false, legendary: false, template: "{mag}% chance to halve damage taken."},
			{name: "skipcooldown", max: 5, min: 5, ordinary: false, epic: false, legendary: true, template: "{mag}% chance to skip your fight cooldown when you lose."},
			{name: "fedoratip", max: 1, min: 1, ordinary: false, epic: true, legendary: false, template: "0.1% chance to use Fedora Tip."},
			{name: "flatdamageafter", max: 2, min: 1, ordinary: true, epic: true, legendary: true, template: "Add {mag} damage to all of your attacks (after modifiers)."},
			{name: "flatdamage", max: 2, min: 1, ordinary: true, epic: true, legendary: true, template: "Add {mag} damage to all of your attacks."}
		]
		
		function getRandomInt(min, max){
			return Math.floor(Math.random() * (max - min + 1) + min);
		}
		
		function generateNewItem(){
			let item = {};
			item.quality = ['Ordinary', 'Epic', 'Legendary'].includes(args.qu) ? args.qu : 'Ordinary';
			let filteredtypes = types.filter(function(element){return element[item.quality.toLowerCase()]})
			let type = types.find(function(element){return element.name === args.ty});
			if(!type){
				type = filteredtypes[getRandomInt(0,filteredtypes.length-1)]
			}
			item.type = type.name;
			item.template = type.template;
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
