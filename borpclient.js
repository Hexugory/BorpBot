module.exports = class BorpClient extends require('discord.js').Client {
    /**
     * Sends a message to multiple channels
     * @param {Discord.TextChannel[]} arr 
     * @param {string|Discord.MessagePayload|Discord.MessageOptions} content 
     */
    sendMessages (arr, content) {
        for (let channel of arr) {
            try {
                this.channels.resolve(channel).send(content).catch(err => console.error(err));
            }
            catch (error) {console.error(error)}
        }
    }
}