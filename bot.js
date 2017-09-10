// documentation https://izy521.gitbooks.io/discord-io/content/
// request https://github.com/request/request

var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var request = require('request');
var parser = require('xml2json');

var version = "2017.09.09.2221",
    owner = "356152143004041218", // DM with Yttrium
    weather_apis = ["c042cb323ce03f09", "d33d792d0d281e83", "97817071da18ec7c", "2bace54c80ae0102"],
    weather_usage = 0,
    phrases = ["When your only tool is a hammer, all problems start looking like nails.", "99 percent of lawyers give the rest a bad name.", "Artificial intelligence is no match for natural stupidity.", "The last thing I want to do is insult you. But it IS on the list.", "I don't have a solution, but I do admire the problem.", "The only substitute for good manners is fast reflexes.", "Support bacteria - they're the only culture some people have.", "Letting the cat out of the bag is a whole lot easier than putting it back in.", "Well, here I am! What are your other two wishes?", "Sounds like its time to get that Enterprise built!", "Time doesn't exist. Clocks exist.", "My mind's made up, don't confuse me with facts.", "Talk is cheap. Until you hire a lawyer.", "Take my advice — I'm not using it.", "I got lost in thoughts. It was unfamiliar territory.", "Sure, I'd love to help you out ... now, which way did you come in?", "I would like to slip into something more comfortable - like a coma.", "I started with nothing, and I still have most of it.", "Ever stop to think, and forget to start again?", "There is no dance without the dancers.", "Out of my mind. Back in five minutes.", "The problem with trouble shooting is that trouble shoots back.", "If you are here - who is running hell?", "If nothing was learned, nothing was taught.", "Very funny, Scotty. Now beam down my clothes...", "The dogs bark but the caravan moves on.", "Which one of these is the non-smoking lifeboat?", "Treat each day as your last; one day you will be right.", "Red meat is not bad for you. Fuzzy green meat is bad for you.", "The early bird may get the worm, but the second mouse gets the cheese.", "Isn't it scary that doctors call what they do \"practice\"?", "The problem with sex in the movies is, that the popcorn usually spills.", "If I want your opinion, I'll ask you to fill out the necessary forms.", "Living on Earth is expensive, but it does include a free trip around the sun.", "Despite the cost of living, have you noticed how popular it remains?", "All power corrupts. Absolute power is pretty neat, though.", "Always remember you're unique, just like everyone else.", "Everybody repeat after me: \"We are all individuals.\"", "Confession is good for the soul, but bad for your career.", "A bartender is just a pharmacist with a limited inventory.", "I want patience - AND I WANT IT NOW!!!!", "A day for firm decisions! Or is it?", "Am I ambivalent? Well, yes and no.", "Bombs don't kill people, explosions kill people.", "Bureaucrats cut red tape, lengthwise.", "Help stamp out, eliminate and abolish redundancy!", "How many of you believe in telekinesis? Raise MY hand!", "A dog has an owner. A cat has a staff.", "Every organization is perfectly designed to get the results they are getting.", "Welcome to Utah: set your watch back 20 years.", "Seen it all, done it all, can't remember most of it.", "Under my gruff exterior lies an even gruffer interior.", "Jesus loves you, it's everybody else that thinks you're an a...", "A clear conscience is usually the sign of a bad memory.", "To steal ideas from one person is plagiarism; to steal from many is research.", "I am an agent of Satan, but my duties are largely ceremonial.", "You have the capacity to learn from your mistakes, and you will learn a lot today.", "Failure is not an option. It's bundled with your software.", "I think sex is better than logic, but I can't prove it.", "I drive way too fast to worry about cholesterol.", "When everything's coming your way, you're in the wrong lane and going the wrong way.", "If at first you don't succeed, redefine success.", "If at first you don't succeed, destroy all evidence that you tried.", "I want to go to IKEA, hide in a wardrobe, wait for someone to open it and yell \"WELCOME TO NARNIA\".", "Life isn't about waiting for the storm to pass ... it's about learning to dance in the rain!", "My conscience is clean — I have never used it."]; // from http://www.smart-words.org/quotes-sayings/famous-one-liners.html
    
function rand(min, max) {
    if (min === max) {
        return min;
    } else {
        return Math.floor(Math.random() * (max - min) + min);
    }
}

// stolen from https://github.com/po-devs/po-server-goodies/blob/master/scripts.js
Object.defineProperty(Array.prototype, "random", {
    configurable: true,
    enumerable: false,
    value: function () {
        return this[rand(0, this.length)];
    }
});
    
function weatherForecast(url, channelID) {
    request.get(url, function(error, response, content) {
        var json = JSON.parse(content);
        if ("error" in json.response) {
            bot.sendMessage({ message: "Error: " + json.response.error.description + ".", to: channelID });
        } else if ("results" in json.response) {
            weather_usage++;
            var res = json.response.results;
            weatherForecast("http://api.wunderground.com/api/" + weather_apis[weather_usage % weather_apis.length] + "/conditions" + res.random().l + ".json", channelID);
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

function stripHTML(str) {
    var regexp = new RegExp("\\<[^\\>]*\\>", "g");
    return str.replace(regexp, "");
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
    
    bot.sendMessage({ message: "Bz bz bzzt! " + version, to: owner });
});

bot.on('message', function (user, userID, channelID, message, evt) {
    if (message.charAt(0) === '!') {
        var args = message.substring(1).split(" ");
        var command = args[0].toLowerCase();       
        args = args.splice(1);
        var data = message.slice(message.indexOf(" ") + 1);
        
        if (bot.channels.hasOwnProperty(channelID) || channelID === owner) {
            switch (command) {
                case "bzt": case "ping":
                    bot.sendMessage({ message: "Bz bz bzzt! " + phrases.random(), to: channelID });
                break;
                case "weather":
                    if (data) {
                        var url = "http://api.wunderground.com/api/" + weather_apis[weather_usage % weather_apis.length] + "/conditions/q";
                        data = data.split(":");
                        for (i = 0; i < data.length; i++) {
                            url += "/" + encodeURIComponent(data[i]);
                        }
                        url += ".json";
                        weatherForecast(url, channelID);
                    };
                break;
                case "define":
                    // http://www.dictionaryapi.com/api/v1/references/collegiate/xml/RECURSION?key=d1726697-c258-48bf-98dd-c6fde96d2809&callback=json
					if (data) {
                        /*request.get("http://www.dictionaryapi.com/api/v1/references/collegiate/xml/" + data.toLowerCase() + "?key=d1726697-c258-48bf-98dd-c6fde96d2809", function(error, response, content) {
                            if (stripHTML(content) == "\r\n\n\t") {
                                bot.sendMessage({ message: "**" + data.toUpperCase() + "** is not a defined word!", to: channelID });
                            } else if (content.indexOf("<dt>") == -1) {
                                var suggestions = content.split("<suggestion>").map(function(word) {
                                    return word.substring(0, word.indexOf("</suggestion>"));
                                }).filter(function(str) {
                                    return str != "";
                                });
                                bot.sendMessage({ message: data.toUpperCase() + " is not a defined word! Suggested words are " + suggestions.map(function(word) { return "**" + word + "**"; }).join(", "), to: channelID });
                            } else {
                                var definition = content.split("<dt>")[1].split("</dt>")[0].split("<vi>")[0].split("<dx>")[0];
                                definition = stripHTML(definition);
                                definition = definition.slice(definition.search(/[A-z]/)).split(":")[0];
                                definition = definition.replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">");
                                bot.sendMessage({ message: "`" + data.toUpperCase() + "` " + definition, to: channelID });
                            }
                        });*/
                        request.get(
                            { 
                                url: "https://od-api.oxforddictionaries.com/api/v1/entries/en/" + data.toLowerCase(), 
                                headers: {
                                    "app_id": "b0f166d5", 
                                    "app_key": "a56267e533514d2e6b5223f09dbb039a"
                                }
                            }, 
                            function(error, response, content) { 
                                var json = JSON.parse(content);
                                var entry = json.results.random().lexicalEntries.random().entries.random().senses.random();
                                if (entry.hasOwnProperty("subsenses") && Math.random() < 0.5) {
                                    entry = entry.subsenses.random();
                                }
                                var definition = entry.definitions.random();
                                bot.sendMessage({ message: "`" + data.toUpperCase() + "` " + definition, to: channelID });
                            }
                        );
                    }
                break;
            }
        } 
        if (channelID === owner) { // owner only commands
            switch (command) {
                case "eval": case "evalp":
                    if (channelID === owner) {
                        try {
                            var res = eval(data);
                            if (command === "evalp") {
                                bot.sendMessage({ message: "Got from eval: " + res, to: channelID });
                            }
                        } catch (err) {
                            bot.sendMessage({ message: "Error in eval: " + err, to: channelID });
                        }
                    }
                break;
                case "game": case "setgame": case "setpresence":
                    bot.setPresence({ game: { name: data } });
                break;
            }
        }
    }
});