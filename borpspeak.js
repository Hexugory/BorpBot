const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');
const prompt = require('prompt');

function speechPrompt(){
	try{
		prompt.get(['send'], function (err, result) {
			if(result.send.startsWith('channel ')){
				promptChannel = result.send.slice(8);
				console.log(`Channel set to ${client.channels.get(promptChannel).name}`);
				return speechPrompt();
			}
			else{
				let promptDest = client.channels.get(promptChannel);
				result.send = result.send.replace("\\n", "\n")
				promptDest.send(result.send);
				console.log(`Sending ${result.send} to ${promptDest.name}`);
				return speechPrompt();
			}
		});
	}
	catch(e){console.log(e)};
}

client.login(config.token);
speechPrompt();