const Jimp = require('jimp');

module.exports = {
	name: 'randomcase',
    description: 'dOEs thIs',
	async execute(msg, args) {
        const avatar = await Jimp.read(msg.author.displayAvatarURL({
            size: 256,
            format: 'png'
        }));
        avatar.greyscale()
              .invert()
              .color([
                { apply: 'blue', params: [ -9999 ] },
                { apply: 'green', params: [ -9999 ] },
                { apply: 'hue', params: [ args.hue ] }
               ])
              .getBuffer(jimp.MIME_PNG, function(err, buffer){
				return msg.channel.send({files: [{attachment: buffer,name: `Edgy-${msg.author.username}.png`}]}).catch(err => console.error(err));
			  });
	},
};
