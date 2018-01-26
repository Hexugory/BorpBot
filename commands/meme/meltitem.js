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
        let duelstats = msg.client.provider.get(msg.guild, "duelstats", {});
        if(!duelstats[msg.author.id]){
			return msg.reply("```diff\n- You have no items or equipped items -```")
        }
        else{
            if(args.id === 'a'){
                if(!duelstats[msg.author.id].borpdust){
                    return msg.reply(`\`\`\`diff\n! You have 0 Borpdust !\`\`\``)
                }
                else{
                    return msg.reply(`\`\`\`diff\n! You have ${duelstats[msg.author.id].borpdust} Borpdust !\`\`\``)
                }
            }
            else{
                if(args.id > duelstats[msg.author.id].items.length-1 || args.id < 0){
                    return msg.reply("```diff\n- Invalid index -```")
                }
                else{
                    let gaineddust = duelstats[msg.author.id].items[args.id].quality === "Legendary" ? 2000 : (duelstats[msg.author.id].items[args.id].quality === "Epic" ? 500 : 100);
                    if(!duelstats[msg.author.id].borpdust){
                        duelstats[msg.author.id].borpdust = gaineddust;
                    }
                    else{
                        duelstats[msg.author.id].borpdust += gaineddust;
                    }
                    duelstats[msg.author.id].items.splice(args.id, 1);
                    msg.client.provider.set(msg.guild, "duelstats", duelstats);
                    return msg.reply(`\`\`\`diff\n! Gained ${gaineddust} Borpdust !\n! You have ${duelstats[msg.author.id].borpdust} Borpdust !\`\`\``)
                }
            }
        }
	}
};
