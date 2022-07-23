const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const { Client, Intents, MessageEmbed, ReactionCollector, MessageManager, Guild, Message } = require("discord.js");
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_WEBHOOKS, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS ] });
const fs = require("fs");
const request = require("request");
const e = require("express");
var port;
var presettoken = null;
if (fs.existsSync("config.json")) {
    const cfg = require("./config.json");
    port = cfg.port;
    presettoken = cfg.token;
} else {
    port = 3001;
    console.log("Config file not found, App will run on port 3001.");
}

var loggedin = 0;

app.use(express.static("public", {index: false}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    if (loggedin === 1) {
        res.sendFile(path.join(__dirname, "public/dashboard.html"));
    } else {
        res.sendFile(path.join(__dirname, "public/index.html"));
    }
});

app.get("/getlogininfo", (req, res) => {
    if (presettoken === null || presettoken === undefined) {
        res.send(false);
    } else {
        res.send(presettoken);
    }
});

app.post("/login", (req, res) => {
    client.login(req.body.bottoken).catch((err) => {
        res.send("<link rel='stylesheet' href='main.css'/><br>There was an error logging in!<br><br>"+err+"<br><br><a href='dashboard'>return to login</a><script>if(window.history.replaceState){window.history.replaceState( null, null, window.location.href);}</script>");
        console.log(err);
        return;
    });
    client.on("ready", (bot) => {
        loggedin = 1;
        res.redirect("dashboard");
    });
});

app.get("/login", (req, res) => {
    if (loggedin === 1) {
        res.redirect("dashboard");
    } else {
        res.redirect("/");
    }
});

app.get("/dashboard", (req, res) => {
    if (loggedin === 1) {
        res.sendFile(path.join(__dirname, "public/dashboard.html"));
    } else {
        res.sendFile(path.join(__dirname, "public/index.html"));
    }
});

app.get("/botname", (req, res) => {
    if (client.isReady()) {
        res.send(client.user.username);
    } else {
        res.send("Unknown");
    }
});

app.get("/clientinfo", (req, res) => {
    if (client.isReady()) {
        var clientinfo = {};
        clientinfo.username = client.user.username;
        clientinfo.createdTimestamp = client.user.createdTimestamp;
        clientinfo.avatar = client.user.avatar;
        clientinfo.status = client.user.presence.status;
        if (client.user.presence.activities[0]) {
            clientinfo.activity = {
                "name" : client.user.presence.activities[0].name,
                "type" : client.user.presence.activities[0].type,
                "url" : client.user.presence.activities[0].url,
            }
            if (client.user.presence.activities[0].type === "STREAMING") {
                clientinfo.status = "streaming";
            }
        }
        clientinfo.guilds = client.guilds.cache;
        res.send(clientinfo);
    } else {
        res.send("NoClient");
    }
});

app.post("/changestatus", (req, res) => {
    if (loggedin === 1) {
        if (req.body.type === "STREAMING") {
            if (!isEmpty(req.body.name) && !isEmpty(req.body.url)) {
                if (isValidUrl(req.body.url)) {
                    client.user.setStatus(req.body.status);
                    client.user.setActivity({
                        type: req.body.type,
                        name: req.body.name,
                        url: req.body.url
                    });
                    res.send({status : "success"});
                } else {
                    res.send({
                        status: "error",
                        code: 399,
                        name: "Invalid URL",
                        message: "URL must be valid!"
                    });
                }
            } else {
                res.send({
                    status : "error",
                    code: 404,
                    name: "Empty Input",
                    message: "Field(s) cannot be empty!"
                });
            }
        } else {
            if (!isEmpty(req.body.name)) {
                client.user.setStatus(req.body.status);
                client.user.setActivity({
                    type: req.body.type,
                    name: req.body.name
                });
                res.send({status : "success"});
            } else {
                res.send({
                    status : "error",
                    code: 404,
                    name: "Empty Input",
                    message: "Field(s) cannot be empty!"
                });
            }
        }
    } else {
        res.redirect("/dashboard");
    }
});

app.get("/changestatus", (req, res) => {
    res.sendFile(path.join(__dirname, "public/dashboard.html"));
});

app.post("/changeusername", async (req, res) => {
    if (loggedin === 1) {
        if (!isEmpty(req.body.changeusername_val)) {
            var iserr = 0;
            await client.user.setUsername(req.body.changeusername_val).catch((err) => {
                res.redirect("?err=400&cmd=ChangeUsername&extra="+err);
                iserr = 1;
                return;        
            });
            if (iserr === 0) {
                res.redirect("?err=0&cmd=ChangeUsername");        
            }
        } else {
            res.redirect("?err=404&cmd=ChangeUsername");
        }
    } 
});

app.get("/changeusername", (req, res) => {
    res.sendFile(path.join(__dirname, "public/dashboard.html"));
});

app.post("/getserverinfo", (req, res) => {
    var serverinfo = req.body;
    client.guilds.fetch(serverinfo.serverid).then((server) => {
        serverinfo.name = server.name;
        serverinfo.afkChannel = server.afkChannel;
        serverinfo.channels = server.channels;
        serverinfo.verified = server.verified;
        serverinfo.icon = server.icon;
        serverinfo.createdTimestamp = server.createdTimestamp;
        serverinfo.description = server.description;
        serverinfo.ownerId = server.ownerId;
        serverinfo.systemChannelId = server.systemChannelId;
        serverinfo.premiumTier = server.premiumTier;
        res.send(serverinfo);
    }).catch((err) => {
        res.send(err);
    });
});

app.post("/getchannelinfo", (req, res) => {
    var channelinfo = req.body;
    client.guilds.fetch(channelinfo.serverid).then((server) => {
        server.channels.fetch(channelinfo.channelid).then((chan) => {
            channelinfo.id = chan.id;
            channelinfo.name = chan.name;
            channelinfo.type = chan.type;
            channelinfo.bitrate = chan.bitrate;
            channelinfo.lastMessageId = chan.lastMessageId;
            channelinfo.full = chan.full;
            channelinfo.nsfw = chan.nsfw;
            channelinfo.userLimit = chan.userLimit;
            channelinfo.createdTimestamp = chan.createdTimestamp;
            res.send(channelinfo);
        }).catch((err) => {
            res.send(err);
        });
    });
});

app.post("/sendmessagetochannel", (req, res) => {
    var messageinfo = req.body;
    client.guilds.fetch(messageinfo.serverid).then((server) => {
        server.channels.fetch(messageinfo.channelid).then(async(channel) => {
            try {
                await channel.send(messageinfo.content);
                res.send(messageinfo);
            } catch(err) {
                var errorinfo = {
                    "code" : err.code,
                    "name" : err.name,
                    "message" : err.message
                }
                res.send(errorinfo);
            }
        });
    });
});

app.post("/getuserbyid", (req, res) => {
    client.users.fetch(req.body.userid).then((user) => {
        var userinfo = {};
        userinfo.id = user.id;
        userinfo.name = user.username;
        userinfo.discriminator = user.discriminator;
        userinfo.avatarURL = user.avatarURL();
        userinfo.createdTimestamp = user.createdTimestamp;
        res.send(userinfo);
    }).catch((err) => {
        var errinfo = {};
        errinfo.code = err.code;
        errinfo.message = err.message;
        errinfo.name = err.name;
        res.send(errinfo);
    });
});

app.get("/getbotinfo", (req, res) => {
    res.send(client.user.id);
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

const isEmpty = (val) => {
    var v;
    if (val === null || val === undefined || val === "" || val === " ") {
        v = true;
    } else {
        v = false;
    }
    return v;
}

const isValidUrl = (val) => {
    var url;
    try {
      url = new URL(val);
    } catch (e) {
      return false;  
    }
    return url.protocol === "http:" || url.protocol === "https:";
}

app.get("/error.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public/dashboard.html"));
});

const VERSION = "0.1.0";
const isLatestVersion = (ver, callback) => {
    request("https://discordbotpanel.cf/data/latestversion.php", (err, res, body) => {
        var isUpToDate;
        if (err) {
            return;
        }
        if (res.statusCode === 200) {
            var obj = JSON.parse(body);
            if (ver === obj.version) {
                isUpToDate = true;
            } else if (ver < obj.version) {
                isUpToDate = false;
            } else if (ver > obj.version) {
                isUpToDate = "over";
            }
            callback(isUpToDate, obj);
        }
    });   
}
isLatestVersion(VERSION, (isit, info) => {
    if (isit !== true) {
        var date = new Date(parseInt(info.date)*1000);
        var datestring = date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear();
        var timestring = date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
        console.log("\n\n[UpdateChecker] There is a new version available! Please find the new version in the github repository here: https://github.com/Superchicken962/discord-bot-local-webpanel\nVersion: "+VERSION+" => "+info.version+"\n\nVersion "+info.version+", released "+datestring+", "+info.info+".\nFor live updates, visit the /updates directory on the webserver.\n");
    } else {
        console.log("[UpdateChecker] All Up to Date! - For live updates, visit the /updates directory on the webserver.\n");
    }
});

app.get("/checkforupdates", (req, res) => {
    isLatestVersion(VERSION, (isit, info) => {
        if (isit !== true) {
            info.currentVer = VERSION;
            if (isit === "over") {
                info.isLatest = "over";
            } else {
                info.isLatest = false;                
            }
            res.send(info);
        } else {
            info.isLatest = true;
            res.send(true);
        }
    });
});

app.get("/updates", (req, res) => {
    res.sendFile(path.join(__dirname, "public/updates.html"));
});