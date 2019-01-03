const commando = require('discord.js-commando');
const sqlite = require('sqlite');
const request = require('request-promise-native');
const password = require('../../config.json').password;

module.exports = class UpdateCardsCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'updatecards',
			group: 'tts',
			memberName: 'updatecards',
			description: 'Update expansion cards.',
			examples: ['\'updatecards'],

			args: [
				{
					key: 'expansion',
					label: 'expansion',
					prompt: 'Enter expansion name.',
                    type: 'string',
                    validate: (str, msg) => {
                        if(msg.client.isOwner(msg.author.id)) return true;
                        switch(str){
                            case "LunaticExtra":
                                return msg.client.isOwner(msg.author.id);
                                break;
                            case "ShitTier":
                                return msg.author.id === "269714882142797834";
                                break;
                            case "GarbageTier":
                                return msg.author.id === "160921909637283842";
                                break;
                            case "TerminalExpansion":
                                return msg.author.id === "269714882142797834";
                                break;
                            case "FoxBox":
                                return msg.author.id === "84098822870962176";
                                break;
                            case "YuriParadise":
                                return msg.author.id === "195366289882087424";
                                break;
                            case "EToFS":
                                return msg.author.id === "142888720738025472";
                                break;
                            case "ZhelotRoles":
                                return msg.author.id === "172784498704908288";
                                break;
                            case "WillofFate":
                                return msg.author.id === "157704875726209025";
                                break;
                            case "DBSCharacters":
                                return msg.author.id === "191266667278368769";
                                break;
                            case "GoldenAdditions":
                                return msg.author.id === "250273321092907008";
                                break;
                            case "DumbassCards":
                                return msg.author.id === "157704875726209025";
                                break;
                            default:
                                return false;
                        }
                    }
				},
				{
					key: 'deck',
					label: 'deck',
					prompt: 'Enter deck name.',
					type: 'string',
                    validate: str => {return ["MainCards", "LunaticCards", "IncidentCards", "CharacterCards", "HeroineCards", "PartnerCards", "StageCards", "ExCards", "RevealCards", "TerminalCards", "PrecognitionCards", "NightCards"].includes(str)}
                },
                {
					key: 'face',
					label: 'face image',
					prompt: 'Enter face image url.',
					type: 'string'
                },
                {
					key: 'back',
					label: 'back image',
					prompt: 'Enter back image url.',
					type: 'string'
                },
                {
					key: 'width',
					label: 'width',
					prompt: 'Enter face width.',
					type: 'integer'
                },
                {
					key: 'height',
					label: 'height',
					prompt: 'Enter face height.',
					type: 'integer'
                },
                {
					key: 'cards',
					label: 'card number',
					prompt: 'Enter deck card number.',
					type: 'integer'
				}
			]
		});
	}
    
    hasPermission(msg) {
		return msg.client.isOwner(msg.author) || (msg.guild && msg.guild.id === "530296766440931328");
	}

	async run(msg, args) {
        let options = {
            method: 'POST',
            uri: 'http://127.0.0.1:8080/danmaku/submit',
            body: {
                password: password,
                expansion: {name:args.expansion}
            },
            json: true
        }
        options.body.expansion[args.deck] = {
            face: args.face,
            back: args.back,
            width: args.width,
            height: args.height,
            cards: args.cards
        };
        request(options).catch(console.error)
        return msg.reply("Update sent.")
	}
};