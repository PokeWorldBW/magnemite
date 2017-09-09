// documentation https://izy521.gitbooks.io/discord-io/content/
// request https://github.com/request/request

var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var request = require('request');

var version = "2017.09.09.0037",
    botchannel = "355137398897901568", // power plant
    startup = false;

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
    
    if (!startup) { // Prevent from sending at random times after disconnects
        bot.sendMessage({ message: "Bz bz bzzt! " + version, to: botchannel });
        startup = true;
    }
});

bot.on('message', function (user, userID, channelID, message, evt) {
    if (message.charAt(0) === '!') {
        var args = message.substring(1).split(" ");
        var command = args[0].toLowerCase();       
        args = args.splice(1);
        var data = message.slice(message.indexOf(" ") + 1);
        
        switch (command) {
            case 'ping':
                bot.sendMessage({
                    message: 'Pong!',
                    to: channelID
                });
                break;
            case "web":
                request.get(data, function(error, response, body) {
                    if (error !== null) {
                        bot.sendMessage({ message: "An error occurred while accessing url " + data + " : " + error, to: channelID });
                    }
                    bot.sendMessage({ message: "resp: " + Object.keys(response), to: channelID });
                });
                break;
         }
     }
});