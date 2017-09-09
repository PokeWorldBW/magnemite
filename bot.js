// documentation https://izy521.gitbooks.io/discord-io/content/

var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var request = require('request');

var version = "2017.09.08.2329",
    botchannel = "355137398897901568",
    startup = false; // power-plant

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
        bot.sendMessage({ message: "Script was updated! (" + version + ")", to: botchannel });
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
                try {
                    bot.sendMessage({
                        message: "Website: " + data,
                        to: channelID
                    });
                    request(data, function (error, response, body) {
                        bot.sendMessage({ message: "Error: " + err, to: channelID });
                        bot.sendMessage({ message: "StatusCode: " + response + " - " + response.statusCode, to: channelID });
                        bot.sendMessage({ message: "Body: " + body, to: channelID });
                    });
                } catch (err) {
                    bot.sendMessage({ message: "You failed! (Error: " + err + ")", to: channelID });            
                }
                break;
         }
     }
});