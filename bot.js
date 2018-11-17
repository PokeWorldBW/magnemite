// documentation https://izy521.gitbooks.io/discord-io/content/
// request https://github.com/request/request

// https://stackoverflow.com/questions/5306729/how-do-markov-chain-chatbots-work/5307230#5307230
// https://walterhickey.tumblr.com/post/116609445662/twitter-markov-bot-part-1-scraping-the-words

// Use node-fetch?

var Discord = require('discord.io');
var logger = require('winston');
var request = require('request');

var version = "2017.10.16.1353",
    owner = "356152143004041218", // DM with Yttrium
    startup = false,
    weather_apis = ["c042cb323ce03f09", "d33d792d0d281e83", "97817071da18ec7c", "2bace54c80ae0102"],
    weather_usage = 0,
    phrases = ["When your only tool is a hammer, all problems start looking like nails.", "99 percent of lawyers give the rest a bad name.", "Artificial intelligence is no match for natural stupidity.", "The last thing I want to do is insult you. But it IS on the list.", "I don't have a solution, but I do admire the problem.", "The only substitute for good manners is fast reflexes.", "Support bacteria - they're the only culture some people have.", "Letting the cat out of the bag is a whole lot easier than putting it back in.", "Well, here I am! What are your other two wishes?", "Sounds like its time to get that Enterprise built!", "Time doesn't exist. Clocks exist.", "My mind's made up, don't confuse me with facts.", "Talk is cheap. Until you hire a lawyer.", "Take my advice — I'm not using it.", "I got lost in thoughts. It was unfamiliar territory.", "Sure, I'd love to help you out ... now, which way did you come in?", "I would like to slip into something more comfortable - like a coma.", "I started with nothing, and I still have most of it.", "Ever stop to think, and forget to start again?", "There is no dance without the dancers.", "Out of my mind. Back in five minutes.", "The problem with trouble shooting is that trouble shoots back.", "If you are here - who is running hell?", "If nothing was learned, nothing was taught.", "Very funny, Scotty. Now beam down my clothes...", "The dogs bark but the caravan moves on.", "Which one of these is the non-smoking lifeboat?", "Treat each day as your last; one day you will be right.", "Red meat is not bad for you. Fuzzy green meat is bad for you.", "The early bird may get the worm, but the second mouse gets the cheese.", "Isn't it scary that doctors call what they do \"practice\"?", "The problem with sex in the movies is, that the popcorn usually spills.", "If I want your opinion, I'll ask you to fill out the necessary forms.", "Living on Earth is expensive, but it does include a free trip around the sun.", "Despite the cost of living, have you noticed how popular it remains?", "All power corrupts. Absolute power is pretty neat, though.", "Always remember you're unique, just like everyone else.", "Everybody repeat after me: \"We are all individuals.\"", "Confession is good for the soul, but bad for your career.", "A bartender is just a pharmacist with a limited inventory.", "I want patience - AND I WANT IT NOW!!!!", "A day for firm decisions! Or is it?", "Am I ambivalent? Well, yes and no.", "Bombs don't kill people, explosions kill people.", "Bureaucrats cut red tape, lengthwise.", "Help stamp out, eliminate and abolish redundancy!", "How many of you believe in telekinesis? Raise MY hand!", "A dog has an owner. A cat has a staff.", "Every organization is perfectly designed to get the results they are getting.", "Welcome to Utah: set your watch back 20 years.", "Seen it all, done it all, can't remember most of it.", "Under my gruff exterior lies an even gruffer interior.", "Jesus loves you, it's everybody else that thinks you're an a...", "A clear conscience is usually the sign of a bad memory.", "To steal ideas from one person is plagiarism; to steal from many is research.", "I am an agent of Satan, but my duties are largely ceremonial.", "You have the capacity to learn from your mistakes, and you will learn a lot today.", "Failure is not an option. It's bundled with your software.", "I think sex is better than logic, but I can't prove it.", "I drive way too fast to worry about cholesterol.", "When everything's coming your way, you're in the wrong lane and going the wrong way.", "If at first you don't succeed, redefine success.", "If at first you don't succeed, destroy all evidence that you tried.", "I want to go to IKEA, hide in a wardrobe, wait for someone to open it and yell \"WELCOME TO NARNIA\".", "Life isn't about waiting for the storm to pass ... it's about learning to dance in the rain!", "My conscience is clean — I have never used it.", "Covfefe", "They misunderestimated me.", "I know the human being and fish can coexist peacefully.", "See, in my line of work you got to keep repeating things over and over and over again for the truth to sink in, to kind of catapult the propaganda.", "I'm the commander, see. I don't need to explain — I do not need to explain why I say things. That's the interesting thing about being the President. Maybe somebody needs to explain to me why they say something, but I don't feel like I owe anybody an explanation.", "This is still a dangerous world. It's a world of madmen and uncertainty and potential mental losses.", "Our enemies are innovative and resourceful, and so are we. They never stop thinking about new ways to harm our country and our people, and neither do we.", "I'm telling you there's an enemy that would like to attack America, Americans, again. There just is. That's the reality of the world. And I wish him [Barack Obama] all the very best.", "I just want you to know that, when we talk about war, we're really talking about peace.", "You bet I cut the taxes at the top. That encourages entrepreneurship. What we Republicans should stand for is growth in the economy. We ought to make the pie higher.", "You work three jobs? ... Uniquely American, isn't it? I mean, that is fantastic that you're doing that.", "Rarely is the question asked: Is our children learning?", "You teach a child to read, and he or her will be able to pass a literacy test.", "As yesterday's positive report card shows, childrens do learn when standards are high and results are measured.", "Mitochondria is the powerhouse of the cell.", "I am the mayor. I can do anything I want."], // from http://www.smart-words.org/quotes-sayings/famous-one-liners.html
    userinfo = {},
    actors = ["Steve Buscemi", "Christopher Lee", "Elizabeth Banks", "Julia Roberts", "Chris Evans", "Jennifer Aniston", "Jackie Chan", "Jeff Daniels", "Sean Connery", "Lindsay Lohan", "Josh Hartnett", "Matthew Broderick", "Dakota Fanning", "Winona Ryder", "Shia LaBeouf", "Meg Ryan", "Charlize Theron", "Shannon Elizabeth", "Isla Fisher", "Sophie Marceau", "Sally Field", "Madonna", "Ewan McGregor", "Lea Thompson", "Eva Mendes", "Macaulay Culkin", "Jonah Hill", "Jude Law", "Margot Kidder", "Whoopi Goldberg", "Hugo Weaving", "Brad Pitt", "Colin Farrell", "Chris Hemsworth", "Ben Stiller", "Steve Martin", "Chris Rock", "Joe Pesci", "Maggie Gyllenhaal", "Kate Beckinsale", "Susan Sarandon", "Sigourney Weaver", "Harrison Ford", "Daniel Stern", "Emma Stone", "Viggo Mortensen", "Denzel Washington", "Uma Thurman", "Clint Eastwood", "Jack Nicholson", "Jon Favreau", "Rupert Everett", "Mark Hamill", "Woody Harrelson", "Jada Pinkett", "Olivia Wilde", "Bonnie Hunt", "Laura Dern", "Christina Ricci", "Catherine Zeta-Jones", "Marisa Tomei", "Billy Dee Williams", "Tim Allen", "Dennis Quaid", "Jason Statham", "Nicole Kidman", "Amy Adams", "Jessica Biel", "Kate Hudson", "George Clooney", "Thandie Newton", "Robert De Niro", "Gary Sinise", "Angelina Jolie", "Megan Fox", "David Cross", "Don Cheadle", "Seth Rogen", "Samuel L. Jackson", "Famke Janssen", "Michael Clarke Duncan", "Jodie Foster", "Cate Blanchett", "Robin Williams", "Jennifer Jason Leigh", "Daniel Craig", "Alec Baldwin", "Kevin Spacey", "Jessica Lange", "Anthony Hopkins", "Ben Affleck", "Madeleine Stowe", "Jane Lynch", "Monica Bellucci", "Helena Bonham Carter", "Chris O'Donnell", "Arnold Schwarzenegger", "Nancy Travis", "Camilla Belle", "Annie Potts", "Drew Barrymore", "Ryan Gosling", "Danny Glover", "Val Kilmer", "Anna Faris", "Anne Hathaway", "Al Pacino", "Michael Douglas", "Antonio Banderas", "Jeremy Renner", "Katherine Heigl", "Geena Davis", "Sharon Stone", "Laura Linney", "Jessica Alba", "Sean Astin", "Kristen Bell", "Kirsten Dunst", "Tara Reid", "Jake Gyllenhaal", "Keanu Reeves", "Robin Wright", "Cameron Diaz", "Rene Zellweger", "Katie Holmes", "Bradley Cooper", "Jennifer Love Hewitt", "Goldie Hawn", "Owen Wilson", "Meryl Streep", "Halle Berry", "Steve Carell", "Andie MacDowell", "Rachel Weisz", "Rosie O'Donnell", "Talia Shire", "James Earl Jones", "Ashley Judd", "Daniel Radcliffe", "Tom Cruise", "Bruce Willis", "Penelope Cruz", "Jeff Goldblum", "Valeria Golino", "Johnny Depp", "Alicia Silverstone", "Liam Neeson", "Kim Basinger", "Tom Hanks", "Robert Downey Jr.", "Hugh Grant", "Catherine O'Hara", "Jeanne Tripplehorn", "Sam Worthington", "Emma Watson", "Christopher Lloyd", "Jamie Foxx", "Eddie Murphy", "Gwyneth Paltrow", "Gabriel Byrne", "Sylvester Stallone", "Julianne Moore", "Michael J. Fox", "Linda Hamilton", "Demi Moore", "Helen Hunt", "Leonardo DiCaprio", "Liv Tyler", "Julie Andrews", "Diane Lane", "Joan Cusack", "Leslie Mann", "Keri Russell", "Sean Bean", "Kate Winslet", "Bette Midler", "Heather Graham", "Rachel McAdams", "John Cusack", "Malin Akerman", "Matthew McConaughey", "Jami Gertz", "Jon Voight", "Jeff Bridges", "Sarah Jessica Parker", "Diane Keaton", "Colin Firth", "Bill Murray", "Christopher Walken", "Denise Richards", "Zoe Saldana", "Jamie Lee Curtis", "Jennifer Garner", "Elisabeth Shue", "Kathleen Quinlan", "Will Smith", "Mel Gibson", "Tina Fey", "Morgan Freeman", "Kristin Scott Thomas", "Jennifer Connelly", "James Franco", "Matt Damon", "Laurence Fishburne", "Ralph Fiennes", "Benjamin Bratt", "Sarah Michelle Gellar", "Jennifer Tilly", "Carmen Electra", "Ian McKellen", "Sandra Bullock", "Debra Winger", "Judi Dench", "Michael Keaton", "Nia Long", "Channing Tatum", "Teri Garr", "Tia Carrere", "Kristen Stewart", "Will Ferrell", "Lucy Liu", "Mark Wahlberg", "Michelle Rodriguez", "Kurt Russell", "Jane Fonda", "Russell Crowe", "Salma Hayek", "Jennifer Lopez", "John Travolta", "Kirstie Alley", "Christian Slater", "Kevin Bacon", "Hugh Jackman", "Dan Aykroyd", "Robert Pattinson", "John Malkovich", "Gene Hackman", "Dwayne Johnson", "Danny DeVito", "Maria Bello", "Brendan Fraser", "Natalie Portman", "Naomi Watts", "Orlando Bloom", "Keira Knightley", "Mary Steenburgen", "Annette Bening", "Jeremy Irons", "Alan Rickman", "Neve Campbell", "Vin Diesel", "Kevin Costner", "Elisha Cuthbert", "Dustin Hoffman", "Michelle Monaghan", "Mike Myers", "Elizabeth Hurley", "Glenn Close", "Tommy Lee Jones", "Paul Rudd", "Carrie Fisher", "Patrick Stewart", "Jennifer Lawrence", "Scarlett Johansson", "Elijah Wood", "Ed Harris", "Téa Leoni", "Kathy Bates", "Jason Bateman", "Bill Pullman", "Rene Russo", "Courteney Cox", "Ryan Reynolds", "Michelle Pfeiffer", "Mila Kunis", "Mary Elizabeth Mastrantonio", "Selma Blair", "Nicolas Cage", "Benedict Cumberbatch", "Tobey Maguire", "Angela Bassett", "Richard Dreyfuss", "Joaquin Phoenix", "Adam Sandler", "Christian Bale", "Judge Reinhold", "Billy Zane", "Richard Gere", "Rose Byrne", "Michael Caine", "Carla Gugino", "Chris Pratt", "Jim Carrey", "Amanda Seyfried", "Willem Dafoe", "Cuba Gooding Jr.", "Rick Moranis", "Elizabeth Perkins", "Reese Witherspoon", "Geoffrey Rush", "Eric Bana", "Queen Latifah", "Gary Oldman", "Michelle Williams", "Vince Vaughn", "Bill Paxton", "Pierce Brosnan", "Rebecca Romijn", "Jack Black", "Julia Stiles"],
    adjectives = ["able","abnormal","absent-minded","above average","adventurous","affectionate","agile","agreeable","alert","amazing","ambitious","amiable","amusing","analytical","angelic","apathetic","apprehensive","ardent","artificial","artistic","assertive","attentive","average","awesome","awful","balanced","beautiful","below average","beneficent","blue","blunt","boisterous","brave","bright","brilliant","buff","callous","candid","cantankerous","capable","careful","careless","caustic","cautious","charming","childish","childlike","cheerful","chic","churlish","circumspect","civil","clean","clever","clumsy","coherent","cold","competent","composed","conceited","condescending","confident","confused","conscientious","considerate","content","cool","cool-headed","cooperative","cordial","courageous","cowardly","crabby","crafty","cranky","crass","critical","cruel","curious","cynical","dainty","decisive","deep","deferential","deft","delicate","demonic","dependent","delightful","demure","depressed","devoted","dextrous","diligent","direct","dirty","disagreeable","discerning","discreet","disruptive","distant","distraught","distrustful","dowdy","dramatic","dreary","drowsy","drugged","drunk","dull","dutiful","eager","earnest","easy-going","efficient","egotistical","elfin","emotional","energetic","enterprising","enthusiastic","evasive","even-tempered","exacting","excellent","excitable","experienced","fabulous","fastidious","ferocious","fervent","fiery","flabby","flaky","flashy","frank","friendly","funny","fussy","generous","gentle","gloomy","glutinous","good","grave","great","groggy","grouchy","guarded","hateful","hearty","helpful","hesitant","hot-headed","hypercritical","hysterical","idiotic","idle","illogical","imaginative","immature","immodest","impatient","imperturbable","impetuous","impractical","impressionable","impressive","impulsive","inactive","incisive","incompetent","inconsiderate","inconsistent","independent","indiscreet","indolent","indefatigable","industrious","inexperienced","insensitive","inspiring","intelligent","interesting","intolerant","inventive","irascible","irritable","irritating","jocular","jovial","joyous","judgmental","keen","kind","lame","lazy","lean","leery","lethargic","level-headed","listless","lithe","lively","local","logical","long-winded","lovable","love-lorn","lovely","maternal","mature","mean","meddlesome","mercurial","methodical","meticulous","mild","miserable","modest","moronic","morose","motivated","musical","naive","nasty","natural","naughty","negative","nervous","noisy","normal","nosy","numb","obliging","obnoxious","old-fashioned","one-sided","orderly","ostentatious","outgoing","outspoken","passionate","passive","paternal","paternalistic","patient","peaceful","peevish","pensive","persevering","persnickety","petulant","picky","plain","plain-speaking","playful","pleasant","plucky","polite","popular","positive","powerful","practical","prejudiced","pretty","proficient","proud","provocative","prudent","punctual","quarrelsome","querulous","quick","quick-tempered","quiet","realistic","reassuring","reclusive","reliable","reluctant","resentful","reserved","resigned","resourceful","respected","respectful","responsible","restless","revered","ridiculous","sad","sassy","saucy","sedate","self-assured","selfish","sensible","sensitive","sentimental","serene","serious","sharp","short-tempered","shrewd","shy","silly","sincere","sleepy","slight","sloppy","slothful","slovenly","slow","smart","snazzy","sneering","snobby","somber","sober","sophisticated","soulful","soulless","sour","spirited","spiteful","stable","staid","steady","stern","stoic","striking","strong","stupid","sturdy","subtle","sullen","sulky","supercilious","superficial","surly","suspicious","sweet","tactful","tactless","talented","testy","thinking","thoughtful","thoughtless","timid","tired","tolerant","touchy","tranquil","ugly","unaffected","unbalanced","uncertain","uncooperative","undependable","unemotional","unfriendly","unguarded","unhelpful","unimaginative","unmotivated","unpleasant","unpopular","unreliable","unsophisticated","unstable","unsure","unthinking","unwilling","venal","versatile","vigilant","warm","warmhearted","wary","watchful","weak","well-behaved","well-developed","well-intentioned","well-respected","well-rounded","willing","wonderful","volcanic","vulnerable","zealous"],
    jobs = ["puppeteer", "marionetteer", "actor/actress", "actuary", "administrative worker", "advertising manager", "aerial rigger", "agricultural adviser", "agricultural machinery mechanic", "agronomist", "air traffic controller", "air traffic safety technician", "aircraft instrument technician", "aircraft mechanic", "airline clerk", "ammunition and explosives operative", "animal technician", "animator", "anthropologist", "applications manager", "apprentice training officer", "archeologist", "architect", "architectural conservation officer", "art critic and historian", "art glazier and window-pane maker", "art metalworker", "art photographer", "art restorer", "legal assistant", "artificial flower maker", "artistic promotions manager", "insurance assessor", "assistant housekeeper", "assistant printing worker", "astrologer", "astronomer", "athlete", "auctioneer", "audio graphic designer", "auditor", "auto-electrician", "auxiliary shop assistant", "auxiliary worker in geological survey", "auxiliary worker in textile and clothing industry", "auxiliary worker in the timber industry", "auxiliary worker in water management", "auxiliaryworker in pharmaceutical and medical production", "baker", "bank clerk", "bank clerk for commercial credit", "banking expert", "barber and hairdresser", "bartender", "basket-maker and weaver", "beauty therapist", "beekeeper", "bibliographer", "biochemist", "biologist", "biotechnologist", "biscuit maker", "blacksmith", "explosives expert", "blast-furnaceman", "blasting works engineer", "boatman/woman", "boiler operator", "boilermaker", "bookbinder", "bookkeeper", "bookmaker", "botanist", "brewer and maltster", "bricklayer", "broadcaster", "announcer", "brush maker", "builders' laborer", "building and road machinery mechanic", "building electrician", "building fitter", "building inspector", "building machine operator", "building materials production operative", "building tinsmith", "building", "civil engineer", "architectural technician", "butcher and sausage-maker", "butler", "button maker", "cab/taxi dispatcher", "cabinet maker", "cable car driver", "cable manufacture laborer", "camera mechanic", "camera operator", "canning worker", "capital markets clerk", "captain of an aircraft", "car mechanic", "car service worker", "home care assistant", "career diplomat", "career guidance counsellor", "caretaker", "carpenter", "cartographer", "cellulose operator", "ceramic model maker", "ceramic painter", "ceramicist", "ceramics", "charter agent", "cheese maker", "chemical industries operative", "chemical industry production manager", "chemical laboratory technician", "chemical plant machine operator in non-ferrous metal production", "chemical plant machine operator", "chemical researcher", "chemical technologist", "children's nurse", "chimney sweep", "chipboard production operative", "choir master/mistress", "choreographer", "circus performer", "cleaner", "clerk for cash or credit card systems", "cloakroom attendant", "coffee roaster", "coffeehouse keeper", "commentator", "reporter", "journalist", "barrista", "commercial lawyer", "company lawyer", "composer", "computer engineer", "information technology operator", "computer network manager", "computer programmer", "concrete worker", "conductor", "confectioner", "conservator", "construction carpenter", "building site manager", "cook", "corrosion control fitter", "bailiff", "craft ceramicist", "craft gilder", "craft glass etcher", "craft glassmaker", "craft metal founder and chaser", "craft metalworker and brazier", "craft mosaic maker", "craft plasterer", "craft stonemason", "craft upholsterer", "crane operator", "crate maker", "criminal investigator", "crop treatment operative", "croupier", "customs officer", "cutler", "dairy worker", "dance teacher", "dancer", "data transfer appliance technician", "debt collector", "painter and decorator", "dental surgery assistant", "dental technician", "dentist", "developing and printing technician", "dietician", "digger", "director", "disc jockey", "dish washer", "dispatch clerk", "dispatcher", "diver", "dog trainer", "doorkeeper", "porter", "draughtsperson", "dresser", "driller", "drilling rig operator", "driver of motor vehicles", "driver's mate", "driving instructor", "dust control technician", "ecologist", "environmentalist", "economist", "editor", "educational methods specialist", "electrical and power systems design engineer", "electrical equipment design engineer", "electrical equipment inspector", "electrical fitter", "electrician", "electroceramic production operative", "electronic engineering technician", "galvaniser", "employment agent", "enamel worker", "engineering fitter", "engineering maintenance technician", "entertainment officer", "environmental protection inspector", "ergonomist", "ethnographer", "exhibitions production manager", "faith healer", "farm worker", "farmer", "fashion designer", "feed production operator", "film critic", "film designer", "film or videotape editor", "film projectionist", "financial analyst", "financial officer", "fine artist", "firefigther", "fire inspector", "fish farmer", "fish warden", "fisherman", "fitter", "fitter of glass instruments", "fitter of gas pipelines", "fitter of steel structures", "flight attendant", "flight engineer", "floor fitter", "plant grower", "flying instructor", "food industry production manager", "food industry technologist", "foreign exchange clerk", "forestry manager", "forestry machine operator", "forestry worker", "fortune teller", "foster parent", "patternmaker", "trimmings maker", "fruit farmer", "funeral service assistant", "fur coat seamstress", "furnace operator", "furrier", "gardener", "gas industry inspector", "general laborer", "geneticist", "geographer", "geological surveying equipment mechanic", "geologist", "geomechanic technician", "geophysicist", "glass decorator", "glass jewelry maker", "glass making machine operator", "glass melter", "glass painter", "glass production worker", "glasscutter", "glassworker", "glazier", "goldsmith", "government licensing official", "graphic designer", "gravedigger", "guide", "gunsmith", "hand embroiderer", "hand lacemaker", "harbor guard", "hardener", "harpooner", "hatter", "heating and ventilating fitter", "heating engineer", "herbalist", "high-rise work specialist", "historian", "historical monuments administrator", "custodian", "horse breeder", "host/hostess", "hotel porter", "hotel receptionist", "hydrologist", "ice-cream maker", "image consultant", "industrial designer", "information assistant", "inspector of telecommunications equipment", "insulation worker", "insurance clerk", "insurance sales person", "interior designer", "interpreter and translator", "investment clerk", "invoice clerk", "jeweller", "jewelry maker", "joiner and cabinetmaker", "judge", "archivist", "keeper of service animals", "knitter", "land surveyor", "landscape architect", "laundry worker & dry-cleaner", "lecturer", "librarian", "lifeguard", "swimming instructor", "lift attendant", "lift fitter", "lighting technician", "lightning conductor fitter", "lithographer", "livestock farmer", "lottery ticket street vendor\t", "machine shop worker", "machinery inspector", "maker of non-woven textiles", "make-up artist and wigmaker", "management accountant", "management consultant", "manager", "supervisor", "marine engineer", "loser", "marine hotel manager", "marketing manager", "masseur/masseuse", "master of ceremonies", "materials handler", "mathematician", "medical laboratory assistant", "mechanic", "mechanical engineering designer", "mechanical engineering production manager", "mechanical engineering technologist", "mechatronic engineer", "metal engraver", "metal grinder", "metal refiner", "metal turner", "metal worker", "steelworker", "metallurgist", "meteorologist", "metrologist", "microbiologist", "midwife", "miller", "milling-machine operator", "mine rescue service mechanic", "mine ventilation technician", "miner", "mining air control technician", "mining electrician", "mining finisher", "mining machine operator", "mining mechanic", "mining rescue worker", "minerals surveyor", "fashion model", "modeller", "motor vehicle bodybuilder", "mountain guide", "multimedia designer", "multimedia programmer", "municipal police officer", "municipal services worker", "municipal street cleaner", "museum/art gallery curator", "music director", "musical instrument mechanic", "musician", "musicologist", "nanny", "naturalist", "nature guide", "newspaper editor", "nuclear power station operator", "nurse", "nursery school teacher", "nutritionist", "office junior", "on-line customer services operator", "operational analyst", "operations electrician for heavy-current equipment", "operations mechanic", "food processing operative", "operative in chemical and synthetic fibre manufacture", "operator in the tobacco industry", "operator of gas plant equipment", "operator of numerically controlled machine tools", "operator of plastic material processing machines", "optical component maker", "optical instrument mechanic", "ore crusher", "orthopaedic shoemaker", "orthotic technician", "orthotist", "prosthetist", "out-of-school educator", "overhead telecommunications cable fitter", "packer", "pediatrician", "palmists", "paper worker", "paramedic", "ambulance worker", "patent agent", "asphalt layer", "road worker", "pawnbroker", "pedicurist", "manicurist", "personnel officer", "pest control officer", "petroleum and petrochemical process operators", "pharmaceutical industry operative", "pharmaceutical laboratory technician", "pharmacist", "philosopher", "photographer", "photographic reporter", "physicist", "physiotherapist", "piano tuner", "pilot", "pipe fitter", "pizza maker", "plumber", "plywood maker", "police assistant", "police investigator", "detective", "political scientist", "pollster", "post office counter clerk", "postal service worker", "postal transport worker", "postal worker", "postmaster/postmistress", "poultry breeder", "poultry butcher", "powder metallurgist", "power engineering specialist", "power station supervisor", "power station operator", "power system worker", "power truck driver", "prefab construction worker", "public relations officer", "President of the United States", "pricing officer", "priest", "minister of religion", "clergyman/woman", "primary school teacher", "printer", "printing machine mechanic", "printing technician", "prison guard", "prison officer", "private detective", "producer", "producer of leather goods", "product designer", "production manager in glass and ceramics", "production manager in textile industry", "production manager in wood industry", "production technologist", "professional soldier", "prompter", "property manager", "props master", "psychiatrist", "psychologist", "psychotherapist", "public administration officer", "public notary", "public relations manager", "landlord/landlady", "publisher", "purchasing officer", "quality control technician", "quality inspector", "radio and TV technician", "radio and TV transmission engineering technician", "radio officer", "radiographer", "radiotherapist", "rail transport worker", "rail vehicle mechanic", "railway carriage and wagon inspector", "railway electrician", "railway engine mechanic", "railway freight handler", "railway guard", "railway operative", "railway ticket/booking office clerk", "railway track construction fitter", "railway yard worker", "real estate agent", "referee", "umpire", "refrigeration engineer", "refuse collector", "registrar", "furniture removal worker", "reproduction technician", "restorer of applied arts and crafts", "retoucher", "river basin keeper", "road sign assistant", "road transport technician", "rolling-mill operator", "roofer", "room maid", "rope maker", "rotating machine fitter", "rubber operator", "rubber processing machine operator", "safety and communication electrician", "safety engineer", "sales assistant", "sales manager", "sales representative", "scaffolder", "scene painter", "scene-shifter", "script editor", "script writer", "sculptor", "seaman/woman", "secondary school teacher", "secretary", "personal assistant", "section supervisor (mines and quarries)", "prostitute", "security guard", "service mechanic", "sewerage system cleaning operator", "sewing machinist", "shepherd", "goatherd", "shift engineer", "ship fitter", "ship's captain", "ship's officer", "shoemaker", "cobbler", "shop cashier", "shunter", "shunting team manager", "school caretaker", "school inspector", "silkworm breeder", "sericulturist", "singer", "smith", "social worker", "sociologist", "solicitor", "songwriter", "sound effects technician", "sound engineer", "spa resort attendant", "special educational needs teacher", "special effects engineer", "special needs teacher", "specialist in animal husbandry", "spectacle frame maker", "speech therapist", "spinner", "stable hand", "stage costume maker", "stage designer", "stage manager", "standards engineer", "state attorney", "public prosecutor", "station manager", "statistician", "stockbroker", "stonemason", "stonecutter", "storekeeper", "stove fitter", "stuntman", "sugar maker", "surgical toolmaker", "surveyor's assistant", "sweet factory worker", "systems analyst", "systems engineer", "tailor", "dressmaker", "lion tamer", "tanner", "tannery worker", "tax specialist", "tax consultant", "technical editor", "technologist in glass and ceramics", "telecommunications cable fitter", "telecommunications dispatcher", "telecommunications engineer", "telecommunications installation and repair technician", "telecommunications mechanic", "telecommunications technician", "telecommunications worker", "telephone operator", "teller", "textile printer", "textile refiner", "textile technologist", "textiles dyer", "doctor", "hygiene service assistant", "nursing auxiliary/health care assistant", "optometrist", "ticket collector", "tinsmith", "tobacco technologist", "tool setter", "toolmaker", "tourist guide", "town planner", "track engineer", "tracklayer", "tractor driver", "trading standards officer", "traffic police officer", "train dispatcher", "train driver", "apprentice chef", "coach", "sports trainer\t", "tram driver", "transportation supervisor", "travel agency clerk", "travel courier", "tunnel builder", "tutor", "typesetter", "underground mine safety engineer", "upholsterer and decorator", "usher/usherette", "valuer", "varnisher", "veterinary surgeon", "veterinary technician", "Vice President of the United States", "viniculturist", "wages clerk\t", "waiter/waitress", "wardrobe master/mistress", "warehouse clerk\t", "waste incineration plant worker", "water supply and distribution manager", "water supply and distribution equipment operator", "water treatment plant operator", "watercourse manager", "watchmaker", "watchman", "security guard", "weaver", "weigher", "weir and dam operator", "welder", "well digger", "whaler", "window cleaner", "window-dresser", "wine maker", "wire-drawer", "wood carver", "wood industry technologist", "woodcutting manager", "woodworking operator", "work study engineer/organization and methods officer", "worker in electrical engineering production", "worker in gas distribution", "worker in pressing and stamping shops", "worker in recycling services", "worker in shoe production", "worker in the food industry", "worker in the paper industry", "worker in the production of building materials", "worker the in fur processing industry", "zookeeper"],    colors = ["Air Force blue","Alice blue","alizarin crimson","almond","amaranth","amber","American rose","amethyst","Android green","anti-flash white","antique brass","antique fuchsia","antique white","ao","apple green","apricot","aqua","aquamarine","army green","arylide yellow","ash grey","asparagus","atomic tangerine","auburn","aureolin","aurometalsaurus","awesome","azure","azure mist","baby blue","baby blue eyes","baby pink","ball blue","banana mania","banana yellow","battleship grey","bazaar","beau blue","beaver","beige","bisque","bistre","bittersweet","black","blanched almond","bleu de france","blizzard blue","blond","blue","blue bell","blue gray","blue green","blue purple","blue violet","blush","bole","bondi blue","bone","boston university red","bottle green","boysenberry","brandeis blue","brass","brick red","bright cerulean","bright green","bright lavender","bright maroon","bright pink","bright turquoise","bright ube","brilliant lavender","brilliant rose","brink pink","british racing green","bronze","brown","bubble gum","bubbles","buff","bulgarian rose","burgundy","burlywood","burnt orange","burnt sienna","burnt umber","Byzantine","Byzantium","cg blue","cg red","cadet","cadet blue","cadet grey","cadmium green","cadmium orange","cadmium red","cadmium yellow","café au lait","café noir","cal poly pomona green","Cambridge blue","camel","camouflage green","canary","canary yellow","candy apple red","candy pink","capri","caput mortuum","cardinal","Caribbean green","carmine","carmine pink","carmine red","carnation pink","carnelian","Carolina blue","carrot orange","celadon","celeste","celestial blue","cerise","cerise pink","cerulean","cerulean blue","chamoisee","champagne","charcoal","chartreuse","cherry","cherry blossom pink","chestnut","chocolate","chrome yellow","cinereous","cinnabar","cinnamon","citrine","classic rose","cobalt","cocoa brown","coffee","Columbia blue","cool black","cool grey","copper","copper rose","coquelicot","coral","coral pink","coral red","cordovan","corn","cornell red","cornflower","cornflower blue","cornsilk","cosmic latte","cotton candy","cream","crimson","crimson red","crimson glory","cyan","daffodil","dandelion","dark blue","dark brown","dark byzantium","dark candy apple red","dark cerulean","dark chestnut","dark coral","dark cyan","dark electric blue","dark goldenrod","dark gray","dark green","dark jungle green","dark khaki","dark lava","dark lavender","dark magenta","dark midnight blue","dark olive green","dark orange","dark orchid","dark pastel blue","dark pastel green","dark pastel purple","dark pastel red","dark pink","dark powder blue","dark raspberry","dark red","dark salmon","dark scarlet","dark sea green","dark sienna","dark slate blue","dark slate gray","dark spring green","dark tan","dark tangerine","dark taupe","dark terra cotta","dark turquoise","dark violet","Dartmouth green","davy grey","debian red","deep carmine","deep carmine pink","deep carrot orange","deep cerise","deep champagne","deep chestnut","deep coffee","deep fuchsia","deep jungle green","deep lilac","deep magenta","deep peach","deep pink","deep saffron","deep sky blue","denim","desert","desert sand","dim gray","dodger blue","dogwood rose","dollar bill","drab","duke blue","earth yellow","ecru","eggplant","eggshell","egyptian blue","electric blue","electric crimson","electric cyan","electric green","electric indigo","electric lavender","electric lime","electric purple","electric ultramarine","electric violet","electric yellow","emerald","eton blue","fallow","falu red","famous","fandango","fashion fuchsia","fawn","feldgrau","fern","fern green","ferrari red","field drab","fire engine red","firebrick","flame","flamingo pink","flavescent","flax","floral white","fluorescent orange","fluorescent pink","fluorescent yellow","folly","forest green","french beige","french blue","french lilac","french rose","fuchsia","fuchsia pink","fulvous","fuzzy wuzzy","gainsboro","gamboge","ghost white","ginger","glaucous","glitter","gold","golden brown","golden poppy","golden yellow","goldenrod","granny smith apple","gray","gray asparagus","green","green blue","green yellow","grullo","guppie green","halayà úbe","han blue","han purple","hansa yellow","harlequin","harvard crimson","harvest gold","heart gold","heliotrope","hollywood cerise","honeydew","hooker green","hot magenta","hot pink","hunter green","icterine","inchworm","India green","Indian red","Indian yellow","indigo","international klein blue","international orange","iris","isabelline","islamic green","ivory","jade","jasmine","jasper","jazzberry jam","jonquil","june bud","jungle green","ku crimson","Kelly green","khaki","la salle green","languid lavender","lapis lazuli","laser lemon","laurel green","lava","lavender","lavender blue","lavender blush","lavender gray","lavender indigo","lavender magenta","lavender mist","lavender pink","lavender purple","lavender rose","lawn green","lemon","lemon yellow","lemon chiffon","lemon lime","light crimson","light thulian pink","light apricot","light blue","light brown","light carmine pink","light coral","light cornflower blue","light cyan","light fuchsia pink","light goldenrod yellow","light gray","light green","light khaki","light pastel purple","light pink","light salmon","light salmon pink","light sea green","light sky blue","light slate gray","light taupe","light yellow","lilac","lime","lime green","Lincoln green","linen","lion","liver","lust","MSU green","macaroni and cheese","magenta","magic mint","magnolia","mahogany","maize","majorelle blue","malachite","manatee","mango tango","mantis","maroon","mauve","mauve taupe","mauvelous","maya blue","meat brown","medium persian blue","medium aquamarine","medium blue","medium candy apple red","medium carmine","medium champagne","medium electric blue","medium jungle green","medium lavender magenta","medium orchid","medium purple","medium red violet","medium sea green","medium slate blue","medium spring bud","medium spring green","medium taupe","medium teal blue","medium turquoise","medium violet red","melon","midnight blue","midnight green","mikado yellow","mint","mint cream","mint green","misty rose","moccasin","mode beige","moonstone blue","mordant red 19","moss green","mountain meadow","mountbatten pink","mulberry","munsell","mustard","myrtle","nadeshiko pink","napier green","naples yellow","navajo white","navy blue","neon carrot","neon fuchsia","neon green","non-photo blue","north texas green","ocean boat blue","ochre","office green","old gold","old lace","old lavender","old mauve","old rose","olive","olive drab","olive green","olivine","onyx","opera mauve","orange","orange yellow","orange peel","orange red","orchid","otter brown","outer space","outrageous orange","oxford blue","pacific blue","pakistan green","palatinate blue","palatinate purple","pale aqua","pale blue","pale brown","pale carmine","pale cerulean","pale chestnut","pale copper","pale cornflower blue","pale gold","pale goldenrod","pale green","pale lavender","pale magenta","pale pink","pale plum","pale red violet","pale robin egg blue","pale silver","pale spring bud","pale taupe","pale violet red","pansy purple","papaya whip","paris green","pastel blue","pastel brown","pastel gray","pastel green","pastel magenta","pastel orange","pastel pink","pastel purple","pastel red","pastel violet","pastel yellow","patriarch","payne grey","peach","peach puff","peach yellow","pear","pearl","pearl aqua","peridot","periwinkle","persian blue","persian indigo","persian orange","persian pink","persian plum","persian red","persian rose","phlox","phthalo blue","phthalo green","piggy pink","pine green","pink","pink flamingo","pink sherbet","pink pearl","pistachio","platinum","plum","Portland orange","powder blue","Princeton orange","Prussian blue","psychedelic purple","puce","pumpkin","purple","purple heart","purple mountain's majesty","purple mountain majesty","purple pizzazz","purple taupe","rackley","radical red","raspberry","raspberry glace","raspberry pink","raspberry rose","raw sienna","razzle dazzle rose","razzmatazz","red","red orange","red brown","red violet","rich black","rich carmine","rich electric blue","rich lilac","rich maroon","rifle green","robin's egg blue","rose","rose bonbon","rose ebony","rose gold","rose madder","rose pink","rose quartz","rose taupe","rose vale","rosewood","rosso corsa","rosy brown","royal azure","royal blue","royal fuchsia","royal purple","ruby","ruddy","ruddy brown","ruddy pink","rufous","russet","rust","Sacramento State green","saddle brown","safety orange","saffron","Saint Patrick blue","salmon","salmon pink","sand","sand dune","sandstorm","sandy brown","sandy taupe","sap green","sapphire","satin sheen gold","scarlet","school bus yellow","screamin green","sea blue","sea green","seal brown","seashell","selective yellow","sepia","shadow","shamrock","shamrock green","shocking pink","sienna","silver","sinopia","skobeloff","sky blue","sky magenta","slate blue","slate gray","smalt","smokey topaz","smoky black","snow","spiro disco ball","spring bud","spring green","steel blue","stil de grain yellow","stizza","stormcloud","straw","sunglow","sunset","sunset orange","tan","tangelo","tangerine","tangerine yellow","taupe","taupe gray","tawny","tea green","tea rose","teal","teal blue","teal green","terra cotta","thistle","thulian pink","tickle me pink","tiffany blue","tiger eye","timberwolf","titanium yellow","tomato","toolbox","topaz","tractor red","trolley grey","tropical rain forest","true blue","tufts blue","tumbleweed","turkish rose","turquoise","turquoise blue","turquoise green","Tuscan red","twilight lavender","tyrian purple","ua blue","ua red","UCLA blue","UCLA gold","UFO green","up forest green","up maroon","USC cardinal","USC gold","ube","ultra pink","ultramarine","ultramarine blue","umber","United Nations blue","University of California gold","unmellow yellow","upsdell red","urobilin","Utah crimson","vanilla","Vegas gold","Venetian red","verdigris","vermilion","veronica","violet","violet blue","violet red","viridian","vivid auburn","vivid burgundy","vivid cerise","vivid tangerine","vivid violet","warm black","waterspout","wenge","wheat","white","white smoke","wild strawberry","wild watermelon","wild blue yonder","wine","wisteria","xanadu","Yale blue","yellow","yellow orange","yellow green","zaffre","zinnwaldite brown"],
    animals = ["Abyssinian","Adelie Penguin","Affenpinscher","Afghan Hound","African Bush Elephant","African Civet","African Clawed Frog","African Forest Elephant","African Palm Civet","African Penguin","African Tree Toad","African Wild Dog","Ainu Dog","Airedale Terrier","Akbash","Akita","Alaskan Malamute","Albatross","Aldabra Giant Tortoise","Alligator","Alpine Dachsbracke","American Bulldog","American Cocker Spaniel","American Coonhound","American Eskimo Dog","American Foxhound","American Pit Bull Terrier","American Staffordshire Terrier","American Water Spaniel","Anatolian Shepherd Dog","Angelfish","Ant","Anteater","Antelope","Appenzeller Dog","Arctic Fox","Arctic Hare","Arctic Wolf","Armadillo","Asian Elephant","Asian Giant Hornet","Asian Palm Civet","Australian Cattle Dog","Australian Kelpie Dog","Australian Mist","Australian Shepherd","Australian Terrier","Avocet","Axolotl","Aye Aye","Baboon","Bactrian Camel","Badger","Balinese","Banded Palm Civet","Bandicoot","Barb","Barn Owl","Barnacle","Barracuda","Basenji Dog","Basking Shark","Basset Hound","Bat","Bavarian Mountain Hound","Beagle","Bear","Bearded Collie","Bearded Dragon","Beaver","Bedlington Terrier","Beetle","Bengal Tiger","Bernese Mountain Dog","Bichon Frise","Binturong","Bird","Birds Of Paradise","Birman","Bison","Russian Terrier","Bloodhound","Bluetick Coonhound","Bobcat","Bolognese Dog","Bombay","Bongo","Bonobo","Booby","Border Collie","Border Terrier","Bornean Orang-Utan","Borneo Elephant","Boston Terrier","Bottle Nosed Dolphin","Boxer Dog","Boykin Spaniel","Brazilian Terrier","Budgerigar","Buffalo","Bull Mastiff","Bull Shark","Bull Terrier","Bulldog","Bullfrog","Bumble Bee","Burmese","Burrowing Frog","Butterfly","Butterfly Fish","Caiman","Caiman Lizard","Cairn Terrier","Camel","Canaan Dog","Capybara","Caracal","Carolina Dog","Cassowary","Cat","Caterpillar","Catfish","Cavalier King Charles Spaniel","Centipede","Cesky Fousek","Chameleon","Chamois","Cheetah","Chesapeake Bay Retriever","Chicken","Chihuahua","Chimpanzee","Chinchilla","Chinese Crested Dog","Chinook","Chinstrap Penguin","Chipmunk","Chow Chow","Cichlid","Clouded Leopard","Clown Fish","Clumber Spaniel","Coati","Cockroach","Collared Peccary","Collie","Common Buzzard","Common Frog","Common Loon","Common Toad","Coral","Cottontop Tamarin","Cougar","Cow","Coyote","Crab","Crab-Eating Macaque","Crane","Crested Penguin","Crocodile","Cross River Gorilla","Curly Coated Retriever","Cuscus","Cuttlefish","Dachshund","Dalmatian","Darwin's Frog","Deer","Desert Tortoise","Deutsche Bracke","Dhole","Dingo","Discus","Doberman Pinscher","Dodo","Dog","Dogo Argentino","Dogue De Bordeaux","Dolphin","Donkey","Dormouse","Dragonfly","Drever","Duck","Dugong","Dunker","Dusky Dolphin","Dwarf Crocodile","Eagle","Earwig","Eastern Gorilla","Eastern Lowland Gorilla","Echidna","Edible Frog","Egyptian Mau","Electric EEl","Elephant","Elephant Seal","Elephant Shrew","Emperor Penguin","Emperor Tamarin","Emu","English Cocker Spaniel","English Shepherd","English Springer Spaniel","Entlebucher Mountain Dog","Epagneul Pont Audemer","Eskimo Dog","Estrela Mountain Dog","Falcon","Fennec Fox","Ferret","Field Spaniel","Fin Whale","Finnish Spitz","Fire-Bellied Toad","Fish","Fishing Cat","Flamingo","Flat Coat Retriever","Flounder","Fly","Flying Squirrel","Fossa","Fox","Fox Terrier","French Bulldog","Frigatebird","Frilled Lizard","Frog","Fur Seal","Galapagos Penguin","Galapagos Tortoise","Gar","Gecko","Gentoo Penguin","Geoffroys Tamarin","Gerbil","German Pinscher","German Shepherd","Gharial","Giant African Land Snail","Giant Clam","Giant Panda Bear","Giant Schnauzer","Gibbon","Gila Monster","Giraffe","Glass Lizard","Glow Worm","Goat","Golden Lion Tamarin","Golden Oriole","Golden Retriever","Goose","Gopher","Gorilla","Grasshopper","Great Dane","Greater Swiss Mountain Dog","Bee-Eater","Greenland Dog","Grey Mouse Lemur","Grey Reef Shark","Grey Seal","Greyhound","Grizzly Bear","Grouse","Guinea Fowl","Guinea Pig","Guppy","Hammerhead Shark","Hamster","Hare","Harrier","Havanese","Hedgehog","Hercules Beetle","Hermit Crab","Heron","Highland Cattle","Himalayan","Hippopotamus","Honey Bee","Horn Shark","Horned Frog","Horse","Horseshoe Crab","Howler Monkey","Human","Humboldt Penguin","Hummingbird","Humpback Whale","Hyena","Ibis","Ibizan Hound","Iguana","Impala","Indian Elephant","Indian Palm Squirrel","Indian Rhinoceros","Indian Star Tortoise","Indochinese Tiger","Indri","Insect","Irish Setter","Irish Wolfhound","Jack Russel","Jackal","Jaguar","Japanese Chin","Japanese Macaque","Javan Rhinoceros","Javanese","Jellyfish","Kakapo","Kangaroo","Keel Billed Toucan","Killer Whale","King Crab","King Penguin","Kingfisher","Kiwi","Koala","Komodo Dragon","Kudu","Labradoodle","Labrador Retriever","Ladybird","Leaf-Tailed Gecko","Lemming","Lemur","Leopard","Leopard Cat","Leopard Seal","Leopard Tortoise","Liger","Lion","Lionfish","Little Penguin","Lizard","LLama","Lobster","Long-Eared Owl","Lynx","Macaroni Penguin","Macaw","Magellanic Penguin","Magpie","Maine Coon","Malayan Civet","Malayan Tiger","Maltese","Manatee","Mandrill","Manta Ray","Marine Toad","Markhor","Marsh Frog","Masked Palm Civet","Mastiff","Mayfly","Meerkat","Millipede","Minke Whale","Mole","Molly","Mongoose","Mongrel","Monitor Lizard","Monkey","Monte Iberia Eleuth","Moorhen","Moose","Moray EEl","Moth","Mountain Gorilla","Mountain Lion","Mouse","Mule","Neanderthal","Neapolitan Mastiff","Newfoundland","Newt","Nightingale","Norfolk Terrier","Norwegian Forest","Numbat","Nurse Shark","Ocelot","Octopus","Okapi","Old English Sheepdog","Olm","Opossum","Orang-Utan","Ostrich","Otter","Oyster","Pademelon","Panther","Parrot","Patas Monkey","Peacock","Pekingese","Pelican","Penguin","Persian","Pheasant","Pied Tamarin","Pig","Pika","Pike","Pink Fairy Armadillo","Piranha","Platypus","Pointer","Poison Dart Frog","Polar Bear","Pond Skater","Poodle","Pool Frog","Porcupine","Possum","Prawn","Proboscis Monkey","Puffer Fish","Puffin","Pug","Puma","Puss Moth","Pygmy Hippopotamus","Pygmy Marmoset","Quail","Quetzal","Quokka","Quoll","Rabbit","Raccoon","Raccoon Dog","Radiated Tortoise","Ragdoll","Rat","Rattlesnake","Tarantula","Panda","Wolf","Red-Handed Tamarin","Reindeer","Rhinoceros","River Dolphin","River Turtle","Robin","Rock Hyrax","Rockhopper Penguin","Roseate Spoonbill","Rottweiler","Royal Penguin","Sabre-Toothed Tiger","Saint Bernard","Salamander","Sand Lizard","Saola","Scorpion","Scorpion Fish","Sea Dragon","Sea Lion","Sea Otter","Sea Slug","Sea Squirt","Sea Turtle","Sea Urchin","Seahorse","Seal","Serval","Sheep","Shih Tzu","Shrimp","Siamese","Siamese Fighting Fish","Siberian","Siberian Husky","Siberian Tiger","Silver Dollar","Skunk","Sloth","Slow Worm","Snail","Snake","Snapping Turtle","Snowshoe","Snowy Owl","Somali","South China Tiger","Spadefoot Toad","Sparrow","Spectacled Bear","Sperm Whale","Spider","Spider Monkey","Spiny Dogfish","Sponge","Squid","Squirrel","Squirrel Monkey","Sri Lankan Elephant","Staffordshire Bull Terrier","Stag Beetle","Starfish","Stellers Sea Cow","Stick Insect","Stingray","Stoat","Striped Rocket Frog","Sumatran Elephant","Sumatran Orang-Utan","Sumatran Rhinoceros","Sumatran Tiger","Sun Bear","Swan","Tang","Tapir","Tarsier","Tasmanian Devil","Tawny Owl","Termite","Tetra","Thorny Devil","Tibetan Mastiff","Tiffany","Tiger","Tiger Salamander","Tiger Shark","Tortoise","Toucan","Tree Frog","Tropicbird","Tuatara","Turkey","Turkish Angora","Uakari","Uguisu","Umbrellabird","Vampire Bat","Vervet Monkey","Vulture","Wallaby","Walrus","Warthog","Wasp","Water Buffalo","Water Dragon","Water Vole","Weasel","Welsh Corgi","West Highland Terrier","Western Gorilla","Western Lowland Gorilla","Whale Shark","Whippet","White Faced Capuchin","Wild Boar","Wildebeest","Wolf","Wolverine","Wombat","Woodlouse","Woodpecker","Woolly Mammoth","Woolly Monkey","Wrasse","X-Ray Tetra","Yak","Yellow-Eyed Penguin","Yorkshire Terrier","Zebra","Zebra Shark","Zebu","Zonkey","Zorse"],
    noun = ["Dream","Dreamer","Dreams","Waves","Sword","Kiss","Sex","Lover","Slave","Slaves","Pleasure","Servant","Servants","Snake","Soul","Touch","Men","Women","Gift","Scent","Ice","Snow","Night","Silk","Secret","Secrets","Game","Fire","Flame","Flames","Husband","Wife","Man","Woman","Boy","Girl","Truth","Edge","Boyfriend","Girlfriend","Body","Captive","Male","Wave","Predator","Female","Healer","Trainer","Teacher","Hunter","Obsession","Hustler","Consort","Dream", "Dreamer", "Dreams","Rainbow","Dreaming","Flight","Flying","Soaring","Wings","Mist","Sky","Wind","Winter","Misty","River","Door","Gate","Cloud","Fairy","Dragon","End","Blade","Beginning","Tale","Tales","Emperor","Prince","Princess","Willow","Birch","Petals","Destiny","Theft","Thief","Legend","Prophecy","Spark","Sparks","Stream","Streams","Waves","Sword","Darkness","Swords","Silence","Kiss","Butterfly","Shadow","Ring","Rings","Emerald","Storm","Storms","Mists","World","Worlds","Alien","Lord","Lords","Ship","Ships","Star","Stars","Force","Visions","Vision","Magic","Wizards","Wizard","Heart","Heat","Twins","Twilight","Moon","Moons","Planet","Shores","Pirates","Courage","Time","Academy","School","Rose","Roses","Stone","Stones","Sorcerer","Shard","Shards","Slave","Slaves","Servant","Servants","Serpent","Serpents","Snake","Soul","Souls","Savior","Spirit","Spirits","Voyage","Voyages","Voyager","Voyagers","Return","Legacy","Birth","Healer","Healing","Year","Years","Death","Dying","Luck","Elves","Tears","Touch","Son","Sons","Child","Children","Illusion","Sliver","Destruction","Crying","Weeping","Gift","Word","Words","Thought","Thoughts","Scent","Ice","Snow","Night","Silk","Guardian","Angel","Angels","Secret","Secrets","Search","Eye","Eyes","Danger","Game","Fire","Flame","Flames","Bride","Husband","Wife","Time","Flower","Flowers","Light","Lights","Door","Doors","Window","Windows","Bridge","Bridges","Ashes","Memory","Thorn","Thorns","Name","Names","Future","Past","History","Something","Nothing","Someone","Nobody","Person","Man","Woman","Boy","Girl","Way","Mage","Witch","Witches","Lover","Tower","Valley","Abyss","Hunter","Truth","Edge"],
    adjective = ["Lost","Only","Last","First","Third","Sacred","Bold","Lovely","Final","Missing","Shadowy","Seventh","Dwindling","Missing","Absent","Vacant","Cold","Hot","Burning","Forgotten","Weeping","Dying","Lonely","Silent","Laughing","Whispering","Forgotten","Smooth","Silken","Rough","Frozen","Wild","Trembling","Fallen","Ragged","Broken","Cracked","Splintered","Slithering","Silky","Wet","Magnificent","Luscious","Swollen","Erect","Bare","Naked","Stripped","Captured","Stolen","Sucking","Licking","Growing","Kissing","Green","Red","Blue","Azure","Rising","Falling","Elemental","Bound","Prized","Obsessed","Unwilling","Hard","Eager","Ravaged","Sleeping","Wanton","Professional","Willing","Devoted","Misty","Lost","Only","Last","First","Final","Missing","Shadowy","Seventh","Dark","Darkest","Silver","Silvery","Living","Black","White","Hidden","Entwined","Invisible","Next","Seventh","Red","Green","Blue","Purple","Grey","Bloody","Emerald","Diamond","Frozen","Sharp","Delicious","Dangerous","Deep","Twinkling","Dwindling","Missing","Absent","Vacant","Cold","Hot","Burning","Forgotten","Some","No","All","Every","Each","Which","What","Playful","Silent","Weeping","Dying","Lonely","Silent","Laughing","Whispering","Forgotten","Smooth","Silken","Rough","Frozen","Wild","Trembling","Fallen","Ragged","Broken","Cracked","Splintered"],
    magic8ball = ["It is certain.", "It is decidedly so.", "Without a doubt.", "Yes, definitely.", "You may rely on it.", "As I see it, yes.", "Most likely.", "Outlook good.", "Yes.", "Signs point to yes.", "Reply hazy try again.", "Ask again later.", "Better not tell you now.", "Cannot predict now.", "Concentrate and ask again.", "Don't count on it.", "My reply is no.", "My sources say no.", "Outlook not so good.", "Very doubtful.", "Reply hazy try again.", "Ask again later.", "Better not tell you now.", "Cannot predict now.", "Concentrate and ask again.", "Don't count on it.", "My reply is no.", "My sources say no.", "Outlook not so good.", "Very doubtful."],
    responses = ["It is certain.", "It is decidedly so.", "Without a doubt.", "Yes, definitely.", "You may rely on it.", "As I see it, yes.", "Most likely.", "Outlook good.", "Yes.", "Signs point to yes.", "Reply hazy try again.", "Ask again later.", "Better not tell you now.", "Cannot predict now.", "Concentrate and ask again.", "Don't count on it.", "My reply is no.", "My sources say no.", "Outlook not so good.", "Very doubtful.", "Reply hazy try again.", "Ask again later.", "Better not tell you now.", "Cannot predict now.", "Concentrate and ask again.", "Very doubtful.", "Absolutely.", "Answer unclear, ask later.", "Cannot foretell now.", "Can't say now.", "Chances aren't good.", "Consult me later.", "Don't bet on it.", "Focus and ask again.", "Indications say yes.", "Looks like yes.", "No.", "No doubt about it.", "Positively.", "Prospect good.", "So it shall be.", "The stars say no.", "Unlikely.", "Very likely.", "Yes.", "You can count on it.", "Bear market ahead.", "Bull market ahead.", "Buy now.", "Buy pork bellies.", "Buy real estate.", "Buy t-bills.", "Change brokers.", "Don't buy on margin.", "Go for it.", "One word: plastics.", "Out to lunch.", "Pay off loans first.", "Ride it out.", "Sell half now.", "Sell now.", "Sell real estate.", "Start own business.", "Tech stocks hot.", "Think precious metals.", "Unclear, ask again.", "I have a 24 hour flu.", "I was abducted by aliens.", "I have amnesia.", "I’m having car trouble.", "Full moon.", "Huh?", "I was mugged.", "It's in the mail.", "It's not my job.", "I've got a headache.", "I have jury duty.", "Kryptonite.", "Mexican food.", "My dog ate it.", "My fish died.", "No hablo ingleses.", "Oprah.", "The voices told me to.", "Traffic was bad.", "What memo?", "At least I love you.", "Brilliant idea!", "Half-full.", "Have you lost weight?", "It can't be all that bad.", "Look on the bright side.", "Nice job!", "Nice outfit!", "Nice try!", "People like you.", "Pure genius!", "That's o.k..", "The sky's the limit.", "Who says you're stupid?", "You can do it!", "You look marvelous.", "Your breath is so minty.", "You're 100% fun!", "You're a winner!", "You're good enough...", "As if.", "Ask me if i care.", "Dumb question, ask another.", "Forget about it.", "Get a clue.", "In your dreams.", "Not.", "Not a chance.", "Obviously.", "Oh please.", "Sure.", "That's ridiculous.", "Well maybe.", "What do you think?", "Whatever.", "Who cares?", "Yeah and I'm the pope.", "Yeah right.", "You wish.", "You've got to be kidding....", "Caught stealing.", "Double.", "Flyout to center.", "Flyout to left.", "Foul out.", "Ground-out to 2nd.", "Ground-out to 3rd.", "Ground-out to short.", "Hit by pitch.", "Home run!", "Pop out.", "Reach on error.", "Single to left.", "Single to right.", "Stolen base.", "Strike-out looking.", "Strike-out swinging.", "Triple.", "Walk.", "Wild pitch - runners advance.", "Par.", "Birdie (1 under par).", "Eagle (2 under par).", "Double eagle (3 under par).", "Hole in one!", "Bogey (1 over par).", "Double bogey (2 over par).", "Triple bogey (3 over par).", "Lost ball - 6 stroke hole.", "7 stroke hole total.", "​8 stroke hole total.", "Mulligan - do-over.", "Whiff - swing again.", "是的.", "毫無疑問.", "絕對是的.", "星象顯示否定.", "應該是.", "星象顯示肯定.", "不可能.", "十分肯定.", "答案不明重新問.", "不要心存希望.", "看起來有像是.", "機會並不好.", "集中精神重新問.", "現在不能說.", "前景良好.", "不.", "很可能.", "現在無法預知.", "稍後諮詢.", "可以指望它.", "да.", "это не так.", "возможно.", "не случайно.", "и.", "возможно.", "Sí.", "No lo es.", "Es posible.", "Ninguna posibilidad.", "Y tal vez.", "True.", "False.", "Nobody cared before, nobody cares now."],
    sources = ["al-jazeera-english", "associated-press", "bbc-news", "bloomberg", "breitbart-news", "business-insider", "buzzfeed", "cnbc", "cnn", "espn", "fortune", "fox-sports", "google-news", "ign", "mtv-news", "national-geographic", "newsweek", "new-york-magazine", "nfl-news", "reddit-r-all", "reuters", "the-economist", "the-huffington-post", "the-new-york-times", "the-wall-street-journal", "the-washington-post", "time", "usa-today"],
    all_sources = "Al Jazeera, Associated Press, BBC, Bloomberg, Breitbart, Business Insider, BuzzFeed, CNBC, CNN, ESPN, Fortune, Fox Sports, Google News, IGN, MTV, National Geographic, Newsweek, New York Magazine, NFL News, Reddit, Reuters, Economist, Huffington Post, New York Times, Wall Street Journal, Washington Post, Time, and USA Today";

var commandInfo = [
    "**MAGNEMITE COMMANDS**",
    "Use a command by typing `!` followed by the command you want to use and any additional data you need to include!",
    "",
    "`8ball` - asks the Magic 8 Ball a question",
    "`actor` (*also*: `actress`) - gives you a random actor and movie name",
    "`animal` - gives you a random animal",
    "`bzt` - makes Magnemite say a random message",
    "`commands` - to know the commands",
    "`define` - gets the definition of some word",
    "`iq` - generates your IQ",
    "`job` - gives you a random job",
    "`news` - gets headlines from a news website",
    "`say` - tells Magnemite what to say",
    "`weather` - tells you the weather in some location",
    "`wiki` - looks something up on Wikipedia",
    "`wikipedia` - same as `wiki` but capitalization is not automatically formatted",
    "",
    "You can also mention Magnemite with a question to make use of its wisdom!"
].join("\n");
    
function rand(min, max) {
    if (min === max) {
        return min;
    } else {
        return Math.floor(Math.random() * (max - min) + min);
    }
}

function random(array) {
    if (!Array.isArray(array)) {
        return null;
    } else {
        return array[rand(0, array.length)];
    }
}

// stolen from https://github.com/po-devs/po-server-goodies/blob/master/scripts.js
function shuffle(array) {
    if (!Array.isArray(array)) {
        return null;
    } else {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }
}
    
function weatherForecast(url, channelID) {
    request.get(url, function(error, response, content) {
        var json = JSON.parse(content);
        if ("error" in json.response) {
            bot.sendMessage({ message: "Error: " + json.response.error.description + ".", to: channelID });
        } else if ("results" in json.response) {
            weather_usage++;
            var res = json.response.results;
            weatherForecast("http://api.wunderground.com/api/" + weather_apis[weather_usage % weather_apis.length] + "/conditions" + random(res).l + ".json", channelID);
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

function resetVariables() {
    userinfo = {};
}

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
var bot = new Discord.Client({
   token: process.env.TOKEN,
   autorun: true
});

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
    
    /*if (!startup) {
        bot.sendMessage({ message: "Bz bz bzzt! " + version, to: owner });
        startup = true;
    }*/
    bot.setPresence({ game: { name: "!commands" } });
    
    setInterval(resetVariables, 600000); // every 10 minutes
});

bot.on('disconnect', function(msg, code) {
    if (code === 0) {
        return console.error(msg);
    }
    bot.connect();
    //bot.sendMessage({ message: "Bz bz bzzt! Successfully reconnected! (Code: " + code + ")", to: owner });
});

bot.on('message', function (user, userID, channelID, message, event) {
    var pos = message.indexOf(" ");
    if (message.charAt(0) === '!') {
        var args = message.substring(1).split(" ");
        var command = args[0].toLowerCase();       
        args = args.splice(1);
        var data = pos !== -1 ? message.slice(pos + 1) : "";
        
        if (bot.channels.hasOwnProperty(channelID) || channelID === owner) {
            switch (command) {
                case "bzt": case "ping":
                    bot.sendMessage({ message: "Bz bz bzzt! " + random(phrases), to: channelID });
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
					if (data) {
                        request.get(
                            {
                                url: "https://od-api.oxforddictionaries.com/api/v1/entries/en/" + data.toLowerCase(), 
                                headers: {
                                    "app_id": "b0f166d5", 
                                    "app_key": "a56267e533514d2e6b5223f09dbb039a"
                                }
                            }, 
                            function(error, response, content) {
                                try {
                                    var json = JSON.parse(content);
                                    var lex_entry = random(random(json.results).lexicalEntries);
                                    var partOfSpeech = lex_entry.lexicalCategory;
                                    var entry = random(lex_entry.entries);
                                    if (!entry.hasOwnProperty("senses")) {
                                        // Use old API because apparently the new one doesn't have definitions for certain words
                                        request.get("http://www.dictionaryapi.com/api/v1/references/collegiate/xml/" + data.toLowerCase() + "?key=d1726697-c258-48bf-98dd-c6fde96d2809", function(error, response, content) {
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
                                                partOfSpeech = content.split("<fl>")[1].split("</fl>")[0];
                                                definition = stripHTML(definition);
                                                definition = definition.slice(definition.search(/[A-z]/)).split(":")[0];
                                                definition = definition.replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">");
                                                bot.sendMessage({ message: "`" + data.toUpperCase() + "` [*" + partOfSpeech.toLowerCase() + "*] " + definition, to: channelID });
                                            }
                                        });
                                    } else {
                                        var sense = random(entry.senses);
                                        if (sense.hasOwnProperty("subsenses") && Math.random() < 0.5) {
                                            sense = random(sense.subsenses);
                                        }
                                        var definition = random(sense.definitions);
                                        bot.sendMessage({ message: "`" + data.toUpperCase() + "` [*" + partOfSpeech.toLowerCase() + "*] " + definition, to: channelID });
                                    }
                                } catch (err) {
                                    bot.sendMessage({ message: "No entry available for **" + data.toUpperCase() + "**!", to: channelID });
                                }
                            }
                        );
                    }
                break;
                case "iq":
                    if (!userinfo.hasOwnProperty(userID)) {
                        userinfo[userID] = {};
                    }
                    if (!userinfo[userID].hasOwnProperty("iq")) {
                        // adapted from https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform
                        var u1 = Math.random(), u2 = Math.random(), trig = Math.random() < 0.5 ? Math.cos : Math.sin;
                            z = Math.sqrt(-2 * Math.log(u1)) * trig(2 * Math.PI * u2);
                        var iq = Math.floor((z * 15 + 100) * 10) / 10;
                        if (bot.channels.hasOwnProperty(channelID) && bot.channels[channelID].name === "power_plant") {
                            iq = Math.floor(Math.sqrt(iq) * 100) / 10 + 12 + Math.floor(Math.pow(Math.random() * 10 + Math.random(), Math.random() + 1)); // iq increase
                        }
                        if (false) { iq = Math.floor((iq - Math.pow(Math.random() * 10 + Math.random(), Math.random() + 1)) * 10) / 10; } // iq decrease
                        if (userID === bot.id) {
                            iq *= Math.floor(Math.pow(10, 1 + Math.random())) / 10;
                        }
                        if (user == "Capen" || user == "Yttrium") {
                        	iq = "infinite"
                        }
                        userinfo[userID].iq = iq;
                    }
                    bot.sendMessage({ message: "<@" + userID + ">'s IQ is " + userinfo[userID].iq + ".", to: channelID });
                break;
                case "actor": case "actress":
                    if (!userinfo.hasOwnProperty(userID)) {
                        userinfo[userID] = {};
                    }
                    var info = userinfo[userID];
                    if (!info.hasOwnProperty("actor") || !info.hasOwnProperty("movie")) {
                        var adj = random(adjective);
                        var n1 = random(noun);
                        var n2 = random(noun);
                        var titles = [adj + " " + n1, "The " + adj + " " + n1, n1 + " of " + n2, "The " + n1 + "'s " + n2, "The " + n1 + " of the " + n2, n1 + " in the " + n2];
                        info.actor = random(actors);
                        info.movie = random(titles);
                    }
                    bot.sendMessage({ message: "<@" + userID + "> is " + info.actor + " starring in the movie \"" + info.movie + "\"", to: channelID });
                break;
                case "animal":
                    if (!userinfo.hasOwnProperty(userID)) {
                        userinfo[userID] = {};
                    }
                    var info = userinfo[userID];
                    if (!info.hasOwnProperty("animal")) {
                        info.animal = random(colors) + " " + random(animals);
                    }
                    bot.sendMessage({ message: "<@" + userID + "> is a" + (["A", "E", "I", "O", "U"].indexOf(info.animal.charAt(0).toUpperCase()) !== -1 ? "n " : " ") + info.animal + ".", to: channelID });
                break;
                case "job":
                    if (!userinfo.hasOwnProperty(userID)) {
                        userinfo[userID] = {};
                    }
                    var info = userinfo[userID];
                    if (!info.hasOwnProperty("job")) {
                        info.job = random(adjectives) + " " + random(jobs);
                    }
                    bot.sendMessage({ message: "<@" + userID + "> is a" + (["a", "e", "i", "o", "u"].indexOf(info.job.charAt(0)) !== -1 ? "n " : " ") + info.job + ".", to: channelID });
                break;
                case "wiki": case "wikipedia":
                    if (data) {
                        if (command === "wiki") {
                            data = data.replace(/\b([A-z]+)/g, function(match) { return match[0].toUpperCase() + match.substring(1).toLowerCase(); });
                        }
                        request.get(
                            "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=" + encodeURIComponent(data),
                            function(error, response, content) {
                                var result = JSON.parse(content).query.pages;
                                var key = Object.keys(result)[0];
                                if (key === "-1") {
                                    bot.sendMessage({ message: "**" + data.toUpperCase() + "** could not be found!!", to: channelID });
                                } else {
                                    var info = result[key].extract;
                                    var tokens = info.split("\n");
                                    if (tokens[0][tokens[0].length - 1] != ":") {
                                        info = tokens[0];
                                    }
                                    if (info.length > 2000) {
                                        info = info.substring(0, 2000);
                                        info = info.substring(0, info.lastIndexOf(".") + 1);
                                    }
                                    if (info === "") {
                                        bot.sendMessage({ message: "**" + data.toUpperCase() + "** could not be found!!", to: channelID });
                                    } else {
                                        bot.sendMessage({ message: "`" + data.toUpperCase() + "` " + info, to: channelID });
                                    }
                                }                               
                            }
                        );
                    }
                break;
                case "commands":
                    bot.sendMessage({ message: commandInfo, to: userID });
                break;
                case "8ball":
                    if (data) {
                        bot.sendMessage({ message: random(magic8ball), to: channelID });
                    }
                break;
                case "say":
                    if (data) {
                        if (bot.channels.hasOwnProperty(channelID)) { // can't delete message in PM
                            bot.deleteMessage({ channelID: channelID, messageID: event.d.id }, 
                                function(error) { 
                                    if (error !== null) { 
                                        bot.sendMessage({ message: "Error deleting message: " + error, to: channelID }); 
                                    } 
                                }
                            );
                        }
                        bot.sendMessage({ message: data, to: channelID });
                    }
                break;
                case "news":
                    var source = random(sources);
                    if (data) {
                        var s = data.toLowerCase().replace(/ /g, "-");
                        var matches = sources.filter(function(src) {
                           return src.indexOf(s) !== -1; 
                        });
                        if (matches.length > 0) {
                            source = s === "time" ? "time" : random(matches); // Time also picks up New York Times
                        } else {
                            bot.sendMessage({ message: "Source **" + data.toUpperCase() + "** not found! Sources I can access are:\n```\n" + all_sources + "\n```", to: channelID });
                            return;
                        }
                    }       
                    request.get(
                        "https://newsapi.org/v1/articles?source=" + source + "&apiKey=33adabff3aa447ef820b69a4907f5245",
                        function(error, response, content) {
                            var result = JSON.parse(content);
                            var articles = shuffle(result.articles).slice(0,  source === "associated-press" ? 1 : 3); // Associated Press article descriptions are really long...
                            var out = ["```css", "#" + source, ""];
                            for (var i = 0; i < articles.length; i++) {
                                var article = articles[i];
                                out.push(article.title);
                                out.push("[" + article.description + "]");
                                out.push("");
                            }
                            out.push("```");
                            bot.sendMessage({ message: out.join("\n"), to: channelID });
                        }
                    );
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
                case "resetvars": case "resetvariables":
                    resetVariables();
                break;
            }
        }
    } else if (pos !== -1 && message.substring(0, pos) === "<@" + bot.id + ">") { // Responds to mentions
        bot.sendMessage({ message: random(responses), to: channelID });
    }
});