const commando = require('discord.js-commando');
const sqlite = require('sqlite');

module.exports = class EquipItemCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'equipitem',
			group: 'meme',
			memberName: 'equipitem',
			description: 'Equip a duel item.',
			examples: ['\'equipitem 5 1'],
			guildOnly: true,

            args: [
                {
                    key: 'id',
                    label: 'index',
                    prompt: 'Please enter item index.',
                    type: 'integer'
                },
                {
                    key: 'sl',
                    label: 'slot',
                    prompt: 'Please enter item slot.',
                    type: 'integer'
                }
            ]
		});
	}
	

	async run(msg, args) {
        let duelstats = msg.client.provider.get(msg.guild, "duelstats" + msg.author.id, null);
        if(!duelstats){
			return msg.reply("You have no items or equipped items.")
        }
        else{
            if(args.id > duelstats.items.length-1 || args.id < 0){
                return msg.reply("Invalid index.")
            }
            else if(args.sl > 3 || args.sl < 1){
                return msg.reply("Invalid slot.")
            }
            else{
                if(duelstats.equipped[args.sl-1] != null){
                    duelstats.items.push(duelstats.equipped[args.sl-1]);
                }
                duelstats.equipped[args.sl-1] = duelstats.items[args.id];
                duelstats.items.splice(args.id, 1);
                msg.client.provider.set(msg.guild, "duelstats" + msg.author.id, duelstats);
                return msg.reply(`Equipped item to slot ${args.sl}.`)
            }
        }
	}
};
