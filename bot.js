// documentation https://izy521.gitbooks.io/discord-io/content/
// request https://github.com/request/request

var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var request = require('request');

var version = "2017.09.09.0059",
    botchannel = "355137398897901568", // power_plant
    startup = false,
    weather_apis = ["c042cb323ce03f09", "d33d792d0d281e83", "97817071da18ec7c", "2bace54c80ae0102"],
    weather_usage = 0;
    
function weather(url, channelID) {
    request.get(url, function(error, response, body) {
        var json = JSON.parse(body);
        if ("error" in json.response) {
            bot.sendMessage({ message: "Error: " + json.response.error.description + ".", to: channelID });
        } else if ("results" in json.response) {
            weather_usage++;
            var res = json.response.results;
            weather("http://api.wunderground.com/api/" + api + "/conditions" + res[sys.rand(0, res.length)].l + ".json", channelID);
        } else {
            var weather = json.current_observation;
            var out = "Current Weather for " + weather.display_location.full;
            var degree = function(string) { return string.replace("F", "°F").replace("C", "°C"); };
            if (weather.display_location.zip != "00000") {
                out += " (" + weather.display_location.zip + ")";
            }
            out += ": ";
            if (weather.weather) {
                out += weather.weather + ", ";
            }
            out += "Temperature: " + degree(weather.temperature_string) + ", W​ind: " + weather.wind_string;
            if (!isNaN(weather.precip_today_metric) && +weather.precip_today_metric !== 0) {
                out += ", Precipation: " + weather.precip_today_string;
            }
            if (weather.heat_index_string != "NA") {
                out += ", Heat Index: " + degree(weather.heat_index_string);
            }
            if (weather.windchill_string != "NA") {
                out += ", Wind Chill: " + degree(weather.windchill_string);
            }
            if (weather.feelslike_string != "NA") {
                out += ", Feels Like: " + degree(weather.feelslike_string);
            }
            //out += ", Last Update: " + new Date(weather.observation_epoch * 1000).toGMTString();
            bot.sendMessage({ message: out, to: channelID });
        }
    });
}

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
            case "weather":
				if (data) {
                    var api = weather_apis[weather_usage % weather_apis.length];
					var url = "http://api.wunderground.com/api/" + api + "/conditions/q";
					data = data.split(":");
                    for (i = 0; i < data.length; i++) {
                        url += "/" + encodeURIComponent(data[i]);
                    }
                    url += ".json";
					weather(url, channelID);
				};
                break;
         }
     }
});