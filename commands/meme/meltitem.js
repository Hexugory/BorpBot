const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const oneLine = require('common-tags').oneLine;

module.exports = class MeltItemCommand extends commando.Command {
	constructor(client) {
		super(client, {
            aliases: ['melt'],
			name: 'meltitem',
			group: 'meme',
			memberName: 'meltitem',
            description: oneLine`Melt an item for Borpdust.
            Pass no argument to view your Borpdust total.
            Using > or < will melt all items greater than or less than the specified index.`,
			examples: ['\'meltitem 5', '\'meltitem >0', '\'meltitem <9'],
			guildOnly: true,

            args: [
                {
                    key: 'id',
                    label: 'index',
                    default: 0,
                    prompt: 'Please enter item index.',
                    type: 'string'
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
            if(args.id === 0){
                if(!duelstats[msg.author.id].borpdust){
                    return msg.reply(`\`\`\`diff\n! You have 0 Borpdust !\`\`\``)
                }
                else{
                    return msg.reply(`\`\`\`diff\n! You have ${duelstats[msg.author.id].borpdust} Borpdust !\`\`\``)
                }
            }
            else{
                var gaineddust = 0
                if(args.id.substr(0,1) === ">" && parseInt(args.id.substr(1), 10) != NaN){
                    for(var i = duelstats[msg.author.id].items.length-1; i > Math.max(parseInt(args.id.substr(1), 10), -1); i--){
                        gaineddust += duelstats[msg.author.id].items[i].quality === "Legendary" ? 2000 : (duelstats[msg.author.id].items[i].quality === "Epic" ? 500 : 100);
                        duelstats[msg.author.id].items.splice(i, 1)
                    }
                }
                else if(args.id.substr(0,1) === "<" && parseInt(args.id.substr(1), 10) != NaN){
                    for(var i = Math.min(parseInt(args.id.substr(1), 10)-1, duelstats[msg.author.id].items.length-1); i > -1; i--){
                        gaineddust += duelstats[msg.author.id].items[i].quality === "Legendary" ? 2000 : (duelstats[msg.author.id].items[i].quality === "Epic" ? 500 : 100);
                        duelstats[msg.author.id].items.splice(i, 1)
                    }
                }
                else if(parseInt(args.id, 10) != NaN && parseInt(args.id, 10) >= 0 && parseInt(args.id, 10) < duelstats[msg.author.id].items.length){
                    gaineddust += duelstats[msg.author.id].items[parseInt(args.id, 10)].quality === "Legendary" ? 2000 : (duelstats[msg.author.id].items[parseInt(args.id, 10)].quality === "Epic" ? 500 : 100);
                    duelstats[msg.author.id].items.splice(parseInt(args.id, 10), 1)
                }
                else{
                    return msg.reply("```diff\n- Invalid index -```")
                }
                if(!duelstats[msg.author.id].borpdust){
                    duelstats[msg.author.id].borpdust = gaineddust;
                }
                else{
                    duelstats[msg.author.id].borpdust += gaineddust;
                }
                msg.client.provider.set(msg.guild, "duelstats", duelstats);
                return msg.reply(`\`\`\`diff\n! Gained ${gaineddust} Borpdust !\n! You have ${duelstats[msg.author.id].borpdust} Borpdust !\`\`\``)
            }
        }
	}
};
