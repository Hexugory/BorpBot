const commando = require('discord.js-commando');
const sqlite = require('sqlite');

module.exports = class EquipItemCommand extends commando.Command {
	constructor(client) {
		super(client, {
            aliases: ['equip'],
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
			return msg.reply("```diff\n- You have no items or equipped items -```")
        }
        else{
            if(args.id > duelstats.items.length-1 || args.id < 0){
                return msg.reply("```diff\n- Invalid index -```")
            }
            else if(args.sl > 4 || args.sl < 1){
                return msg.reply("```diff\n- Invalid slot -```")
            }
            else{
                if((args.sl === 4 && !duelstats.items[args.id].moveset) || (args.sl < 4 && duelstats.items[args.id].moveset)){
                    return msg.reply(`\`\`\`diff\n- Cannot equip in that slot -\`\`\``)
                }
                else{
                    if(args.sl === 4){
                        if(duelstats.moveset){
                            duelstats.items.push(duelstats.moveset);
                        }
                        duelstats.moveset = duelstats.items[args.id];
                        duelstats.items.splice(args.id, 1);
                        msg.client.provider.set(msg.guild, "duelstats" + msg.author.id, duelstats);
                        return msg.reply(`\`\`\`diff\n! Equipped item to slot ${args.sl} !\`\`\``)
                    }
                    else{
                        if(duelstats.equipped[args.sl-1] != null){
                            duelstats.items.push(duelstats.equipped[args.sl-1]);
                        }
                        duelstats.equipped[args.sl-1] = duelstats.items[args.id];
                        duelstats.items.splice(args.id, 1);
                        msg.client.provider.set(msg.guild, "duelstats" + msg.author.id, duelstats);
                        return msg.reply(`\`\`\`diff\n! Equipped item to slot ${args.sl} !\`\`\``)
                    }
                }
            }
        }
	}
};
