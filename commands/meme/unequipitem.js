const commando = require('discord.js-commando');
const sqlite = require('sqlite');

module.exports = class UnequipItemCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'unequipitem',
			group: 'meme',
			memberName: 'unequipitem',
			description: 'Unequip a duel item.',
			examples: ['\'unequipitem 3'],
			guildOnly: true,

            args: [
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
            if(args.sl > 3 || args.sl < 1){
                return msg.reply("```diff\n- Invalid slot -```")
            }
            else{
                if(duelstats.equipped[args.sl-1]){
                    duelstats.items.push(duelstats.equipped[args.sl-1]);
                    duelstats.equipped[args.sl-1] = null;
                    msg.client.provider.set(msg.guild, "duelstats" + msg.author.id, duelstats);
                    return msg.reply(`\`\`\`diff\n! Unequipped item !\`\`\``)
                }
                else{
                    return msg.reply(`\`\`\`diff\n- There's no item in that slot -\`\`\``)
                }
            }
        }
	}
};
