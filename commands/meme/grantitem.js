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

module.exports = class GrantItemCommand extends commando.Command {
	constructor(client) {
		super(client, {
			aliases: ['grant'],
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
				},
				{
					key: 'mag',
					label: 'magnitude',
					prompt: 'Specify magnitude.',
					type: 'integer'
				},
				{
					key: 'ds',
					label: 'description',
					prompt: 'Specify description.',
					type: 'string'
				}
			]
		});
	}
	
	hasPermission(msg) {
		return this.client.isOwner(msg.author);
	}

	async run(msg, args) {
		function ucFirst(string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		}
		function getRandomInt(min, max){
			return Math.floor(Math.random() * (max - min + 1) + min);
		}
		function clone(obj) {
			// Handle the 3 simple types, and null or undefined
			if (null == obj || "object" != typeof obj) return obj;
		
			// Handle Date
			if (obj instanceof Date) {
				var copy = new Date();
				copy.setTime(obj.getTime());
				return copy;
			}
		
			// Handle Array
			if (obj instanceof Array) {
				var copy = [];
				for (var i = 0, len = obj.length; i < len; i++) {
					copy[i] = clone(obj[i]);
				}
				return copy;
			}
		
			// Handle Object
			if (obj instanceof Object) {
				var copy = {};
				for (var attr in obj) {
					if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
				}
				return copy;
			}
		
			throw new Error("Unable to copy obj! Its type isn't supported.");
		}
		function generateNewItem(){
			let item = {};
			item.quality = args.qu
			let type = duelconfig.types.find(function(element){return element.name === args.ty});
			if(!type){
				type = duelconfig.types[getRandomInt(0,duelconfig.types.length-1)]
			}
			item.type = type.name;
			item.moveset = toBoolean(type.moveset);
			item.mag = args.mag;
			item.template = args.ds;
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
				if(item.template){
					return `${item.quality} quality: ${createStringFromTemplate(item.template, {mag: item.mag})}`;
				}
				else{
					return `${item.quality} quality: ${createStringFromTemplate(duelconfig.types.find("name", item.type).template, {mag: item.mag})}`;
				}
			}
		}
		let duelstats = msg.client.provider.get(msg.guild, "duelstats", {});
		if(duelstats[args.member.user.id]){
			duelstats[args.member.user.id].items.push(generateNewItem());
			msg.client.provider.set(msg.guild, "duelstats", duelstats);
		}
		else{
			duelstats[args.member.user.id] = {items: [generateNewItem()], equipped: [null, null, null]};
			msg.client.provider.set(msg.guild, "duelstats", duelstats);
		}
		if(msg.client.provider.get(msg.guild, 'optlist', []).includes(args.member.user.id)){
			args.member.user.send(`You have gained an item: ${createDescString(duelstats[args.member.user.id].items[duelstats[args.member.user.id].items.length-1])}`)
		}
	}
};
