const commando = require('discord.js-commando');
const sqlite = require('sqlite');

module.exports = class MeltItemCommand extends commando.Command {
	constructor(client) {
		super(client, {
            aliases: ['melt'],
			name: 'meltitem',
			group: 'meme',
			memberName: 'meltitem',
			description: 'Melt an item for Borpdust. Pass no argument to view your Borpdust total.',
			examples: ['\'meltitem 5'],
			guildOnly: true,

            args: [
                {
                    key: 'id',
                    label: 'index',
                    default: 'a',
                    prompt: 'Please enter item index.',
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
            if(args.id === 'a'){
                if(!duelstats.borpdust){
                    return msg.reply(`\`\`\`diff\n! You have 0 Borpdust !\`\`\``)
                }
                else{
                    return msg.reply(`\`\`\`diff\n! You have ${duelstats.borpdust} Borpdust !\`\`\``)
                }
            }
            else{
                if(args.id > duelstats.items.length-1 || args.id < 0){
                    return msg.reply("Invalid index.")
                }
                else{
                    let gaineddust = duelstats.items[args.id].quality === "Legendary" ? 2000 : (duelstats.items[args.id].quality === "Epic" ? 500 : 100);
                    if(!duelstats.borpdust){
                        duelstats.borpdust = gaineddust;
                    }
                    else{
                        duelstats.borpdust += gaineddust;
                    }
                    duelstats.items.splice(args.id, 1);
                    msg.client.provider.set(msg.guild, "duelstats" + msg.author.id, duelstats);
                    return msg.reply(`\`\`\`diff\n! Gained ${gaineddust} Borpdust !\n! You have ${duelstats.borpdust} Borpdust !\`\`\``)
                }
            }
        }
	}
};
