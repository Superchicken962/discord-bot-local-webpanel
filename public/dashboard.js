const getClientInfo = (callback) => {
    var req = new XMLHttpRequest();
    req.open("get", "/clientinfo", true);
    req.send();
    req.onload = function() {
        var res = this.responseText;
        if (res === "NoClient") {
            callback(false);
            return;
        }
        var info = JSON.parse(res);
        callback(info);
    }
}

const refreshDashboard = () => {
    getClientInfo((obj) => {
        if (obj === false) {
            return;
        }
        document.querySelector(".botnametxt").textContent = obj.username;
        var statusdiv = document.querySelector(".botstatusdiv")
        var statuscircle = document.createElement("span");
        statuscircle.classList.add("statuscircle");
        var statustxt = "Unknown";
        if (obj.status === "online") {
            statustxt = "Online";
            statuscircle.classList.add("online");
        } else if (obj.status === "idle") {
            statustxt = "Idle";
            statuscircle.classList.add("idle");
        } else if (obj.status === "dnd") {
            statustxt = "Do Not Disturb";
            statuscircle.classList.add("dnd");
        } else if (obj.status === "invisible") {
            statustxt = "Invisible";
            statuscircle.classList.add("invisible");
        } else if (obj.status === "streaming") {
            statustxt = "Streaming";
            statuscircle.classList.add("streaming");
        }
        statusdiv.innerHTML = "<b>Status</b><br>";
        statusdiv.append(statuscircle);
        statusdiv.innerHTML += " "+statustxt+" ";
        // statusdiv.append(statuscircle);
        if (obj.activity) {
            document.querySelector(".botactivitydiv").style.display = "block";
            var activtxt = "<b>Type: </b>"+obj.activity.type+"<br><b>Name: </b>"+obj.activity.name;
            if (obj.activity.type === "STREAMING") {
                activtxt += "<br><b>URL: </b>"+obj.activity.url;
            }
            document.querySelector(".botactivitytxt").innerHTML = activtxt;
        } else {
            document.querySelector(".botactivitydiv").style.display = "none";
        }
        var guildsdiv = document.querySelector(".guildsdiv");
        guildsdiv.innerHTML = "<br>";
        obj.guilds.forEach((guildinfo) => {
            guildsdiv.innerHTML += guildinfo.name+"<br>";
        });
        guildsdiv.innerHTML += "<br><a class='guildinfo_morebtn'>more info</a>";
        document.querySelector(".guildinfo_morebtn").addEventListener("click", guildInfoPopup);
    });
}

const closeGuildInfoPopup = () => {
    var panel = document.querySelector(".guildinfo_panel");
    panel.style.display = "none";
}

const guildInfoPopup = () => {
    var panel = document.querySelector(".guildinfo_panel");
    panel.innerHTML = '<a class="guildinfo_panel_close" onclick="closeGuildInfoPopup()">X</a><h2>Guilds</h2><select class="guildinfo_panel_select"></select>';
    panel.style.display = "block";
    var selector = document.querySelector(".guildinfo_panel_select");
    getClientInfo((obj) => {
        obj.guilds.forEach((server) => {
            var serverchoose = document.createElement("option");
            serverchoose.value = server.id;
            serverchoose.textContent = server.name;
            selector.append(serverchoose);
        });
        panel.innerHTML += "<button type='button' class='guildinfo_panel_submitbtn'>Get</button><br><br>";
        document.querySelector(".guildinfo_panel_submitbtn").addEventListener("click", guildInfoPopup_ShowInfo);
    });
}

const guildInfoPopup_ShowInfo = () => {
    var panel = document.querySelector(".guildinfo_panel");
    var selector = document.querySelector(".guildinfo_panel_select");
    var submitbtn = document.querySelector(".guildinfo_panel_submitbtn");
    var serverchoice = selector.value;
    selector.disabled = true;    
    var output = "";
    getClientInfo(async(obj) => {
        var findserver = obj.guilds.find(element => element.id === serverchoice);
        if (findserver) {
            var datecreated = new Date(parseInt(findserver.createdTimestamp));
            var datestring = datecreated.toDateString();
            var timestring = datecreated.getHours()+":"+datecreated.getMinutes()+":"+datecreated.getSeconds();
            var guildicon;
            var borderstyle;
            var imgtitle;
            if (findserver.iconURL) {
                guildicon = findserver.iconURL;
                borderstyle = "none";
                imgtitle = "Server Icon";
            } else {
                guildicon = "assets/missing.png";
                borderstyle = "1.5px solid red";
                imgtitle = "No Server Icon";
            }
            var ownerinfo = await getUserByID(findserver.ownerId);
            panel.innerHTML += "<h3><img src='"+guildicon+"' class='guildicon'/ title='"+imgtitle+"'> "+findserver.name+"</h3>";
            document.querySelector(".guildicon").style.border = borderstyle;
            output += "<p>";
            output += "Owner: "+ownerinfo.name+"#"+ownerinfo.discriminator+"<br>";
            output += "Created: "+datestring+", "+datecreated.toLocaleTimeString()+"<br>";
            output += "Channels: <a class='guild_channelsnum a_btn' title='View Channels'>"+findserver.channels.length+"</a><br>";
            output += "Roles: "+findserver.roles.length+"<br>";
            output += "Emojis: "+findserver.emojis.length+"<br>";
            output += "Nitro Level: "+findserver.premiumTier+"<br>";
            output += "Nitro Boosts: "+findserver.premiumSubscriptionCount+"<br>";
            output += "</p>";
            panel.innerHTML += output;
        }
        document.querySelector(".guildinfo_panel_submitbtn").textContent = "Change";
        document.querySelector(".guildinfo_panel_submitbtn").addEventListener("click", guildInfoPopup);
        document.querySelector(".guild_channelsnum").addEventListener("click", () => {channelsPanel(findserver)});
    });
}

const channelsPanel = async(guild) => {
    var panel = document.querySelector(".channelinfo_panel");
    var closebtn = document.querySelector(".channelinfo_panel_close");
    var guildtitle = document.querySelector(".channelinfo_guildtitle");
    var paneldatapart = document.querySelector(".channelinfo_panel_data");
    panel.style.display = "block";
    var guildicon;
    var borderstyle;
    var imgtitle;
    if (guild.iconURL) {
        guildicon = guild.iconURL;
        borderstyle = "none";
        imgtitle = "Server Icon";
    } else {
        guildicon = "assets/missing.png";
        borderstyle = "1.5px solid red";
        imgtitle = "No Server Icon";
    }
    guildtitle.innerHTML = "<img class='guildicon guildicon_chpanel' src='"+guildicon+"' title='"+imgtitle+"'/> "+guild.name;
    document.querySelector(".guildicon_chpanel").style.border = borderstyle;
    var channelsarr = [];
    const channelpromise = new Promise((resolve, reject) => {
        guild.channels.forEach(async(ch) => {
            var channel = await getChannelById(guild.id, ch);
            channelsarr.push({"id" : channel.id, "name" : channel.name, "type" : channel.type, "bitrate" : channel.bitrate, "lastMessageId" : channel.lastMessageId, "full" : channel.full, "nsfw" : channel.nsfw, "userLimit" : channel.userLimit, "createdTimestamp" : channel.createdTimestamp});
            if (channelsarr.length === guild.channels.length) {
                resolve();
            }
        });
    }).then(() => {
        paneldatapart.innerHTML = "";
        channelsarr.forEach((channel) => {
            if (channel.type !== "GUILD_CATEGORY") {
                paneldatapart.innerHTML += channel.name+"<br>";
            }
        });
    });
}

const closeChannelsPanel = () => {
    document.querySelector(".channelinfo_panel").style.display = "none";
}

const getChannelById = (serverid, channelid) => {
    return new Promise((res, rej) => {
        var req = new XMLHttpRequest();
        req.open("POST", "/getchannelinfo", true);
        req.setRequestHeader("Content-type", "application/json");
        var params = JSON.stringify({"serverid" : serverid, "channelid" : channelid});
        req.send(params);
        req.onload = function() {
            if (this.status >= 200 && this.status < 300) {
                res(JSON.parse(req.response));
            } else {
                rej({
                    status: this.status,
                    statusText: this.statusText 
                });
            }
        }
        req.onerror = function() {
            rej({
                status: this.status,
                statusText: this.statusText 
            });
        }
    })
}

const getUserByID = (id) => {
    return new Promise((resolve, reject) => {
        var req = new XMLHttpRequest();
        req.open("POST", "/getuserbyid", true);
        req.setRequestHeader('Content-Type', 'application/json');
        var params = JSON.stringify({"userid" : id});
        req.send(params);
        req.onload = function() {
            if (this.status >= 200 && this.status < 300) {
                resolve(JSON.parse(req.response));
            } else {
                reject({
                    status: this.status,
                    statusText: this.statusText
                });
            }
        }
        req.onerror = function() {
            reject({
                status: this.status,
                statusText: this.statusText
            });
        }
    });
}

refreshDashboard();

const checkForUpdates = () => {
    var req = new XMLHttpRequest();
    req.open("get", "/checkforupdates", true);
    req.setRequestHeader("Content-type", "application/json");
    req.send();
    req.onload = function() {
        var response = this.responseText;
        var ob = JSON.parse(response);
        if (ob.isLatest === false) {
            var info = JSON.parse(response);
            var newupdatediv = document.createElement("div");
            newupdatediv.classList.add("newupdatebanner_div");
            newupdatediv.innerHTML = "<h1>Update Available!</h1><p>Version <b>"+info.version+"</b> now available for download <a href='https://discordbotpanel.cf/githubrepo' target='_blank'>here</a><br>Read more <a href='../updates'>here</a></p>";
            document.body.append(newupdatediv);
        }
    }
};
checkForUpdates();

var command = document.querySelectorAll(".command");
for (var i = 0; i < command.length; i++) {
    command[i].addEventListener("click", function() {
        this.classList.toggle("command-active");
        var cnt = this.nextElementSibling;
        if (cnt.style.maxHeight) {
            cnt.style.maxHeight = null;
        } else {
            // cnt.style.maxHeight = cnt.scrollHeight + "px";
            cnt.style.maxHeight = "400px";
        }
    });
}

var changestatus_select = document.querySelector(".changestatus_selecter");
var changestatus_streamurl_div = document.querySelector(".changestatus_streamurl_div");
changestatus_select.addEventListener("click", () => {
    if (changestatus_select.value === "STREAMING") {
        changestatus_streamurl_div.style.display = "block";
    } else {
        changestatus_streamurl_div.style.display = "none";
    }
});

const returnResponse = (type, response) => {
    var el = document.querySelector(".returnresponse");
    if (type === "clear") {
        el.style.display = "none";
        return;   
    }
    el.style.display = "block";
    el.innerHTML = "<h2>"+response+"</h2><a class='returnresponse_close'>[X] </a>";
    el.classList.remove("error_rr_colour");
    el.classList.remove("success_rr_colour");
    el.classList.add(type+"_rr_colour");
    document.querySelector(".returnresponse_close").addEventListener("click", closeReturnResponse)
}

const closeReturnResponse = () => {
    document.querySelector(".returnresponse").style.display = "none";
}

var searchurl = new URLSearchParams(location.search);
if (searchurl.get("err") !== null) {
    var err = searchurl.get("err");
    var cmd = searchurl.get("cmd");
    var extra = searchurl.get("extra");
    if (cmd === null) cmd = "UnknownCmd";
    if (err === "0") {
        returnResponse("success", "["+cmd+"] Success!");
    } else if (err === "400") {
        returnResponse("error", "["+cmd+"] Specific Error!<br>"+extra)
    } else if (err === "404") {
        returnResponse("error", "["+cmd+"] Field(s) cannot be empty!");
    } else {
        returnResponse("error", "Unknown Error");
    }
}

var changestatus_savebtn = document.querySelector(".changestatus_savebtn");
var changestatus_value = document.querySelector(".changestatus_value");
var changestatus_streamurl = document.querySelector(".changestatus_streamurl");
var changestatus_selecter = document.querySelector(".changestatus_selecter");
var changestatus_statusselector = document.querySelector(".changestatus_statusselector");
changestatus_savebtn.addEventListener("click", () => {
    var req = new XMLHttpRequest();
    req.open("POST", "/changestatus", true);
    req.setRequestHeader('Content-Type', 'application/json');
    var url;
    if (changestatus_streamurl.value === "") {
        url = null;
    } else {
        url = changestatus_streamurl.value;
    }
    var params = JSON.stringify({
        "status" : changestatus_statusselector.value,
        "name" : changestatus_value.value,
        "type" : changestatus_selecter.value,
        "url" : url
    });
    req.send(params);
    req.onload = function() {
        var info = this.responseText;
        var obj = JSON.parse(info);
        if (obj.code && obj.message) {
            returnResponse("error", "[SetStatus] "+obj.name+"<br>"+obj.message);
            return;
        }
        returnResponse("success", "[SetStatus] Success!");
    }
    refreshDashboard();
});

var sendmessage_saveserver = document.querySelector(".sendmessage_saveserver");
var sendmessage_serverid = document.querySelector(".sendmessage_serverid");
var sendmessage_serverid_label = document.querySelector(".sendmessage_serverid_label");
var sendmessage_channelid_div = document.querySelector(".sendmessage_channelid_div");
var sendmessage_savechannel = document.querySelector(".sendmessage_savechannel");
var sendmessage_channelid_label = document.querySelector(".sendmessage_channelid_label");
var sendmessage_channelid = document.querySelector(".sendmessage_channelid");
var sendmessage_message_div = document.querySelector(".sendmessage_message_div");
var sendmessage_message = document.querySelector(".sendmessage_message");
var sendmessage_savemessage = document.querySelector(".sendmessage_savemessage");
var sendmessage_message_label = document.querySelector(".sendmessage_message_label");
sendmessage_saveserver.addEventListener("click", () => {
    var req = new XMLHttpRequest();
    req.open("POST", "/getserverinfo", true);
    req.setRequestHeader('Content-Type', 'application/json');
    var param = JSON.stringify({"serverid": sendmessage_serverid.value});
    req.send(param);
    req.onload = function() {
        var info = this.responseText;
        var arr = JSON.parse(info);
        if (arr.code && arr.message) {
            returnResponse("error", "[SendMessage] "+arr.name+"<br>"+arr.message);
            return;
        }
        returnResponse("clear", null);
        sendmessage_saveserver.style.display = "none";
        sendmessage_serverid.style.display = "none"; 
        sendmessage_serverid_label.textContent = "Server: "+arr.name;
        sendmessage_channelid_div.style.display = "block";
        sendmessage_savechannel.addEventListener("click", submitChannelToCheck);
    };
});

const submitChannelToCheck = () => {
    var reques = new XMLHttpRequest();
    reques.open("POST", "/getchannelinfo", true);
    reques.setRequestHeader('Content-Type', 'application/json');
    var param = JSON.stringify({"serverid": sendmessage_serverid.value, "channelid": sendmessage_channelid.value});
    reques.send(param);
    reques.onload = function() {
        var info = this.responseText;
        var arr = JSON.parse(info);
        if (arr.code && arr.message) {
            returnResponse("error", "[SendMessage] "+arr.name+"<br>"+arr.message);
            return;
        }
        returnResponse("clear", null);
        sendmessage_savechannel.style.display = "none";
        sendmessage_channelid.style.display = "none";
        sendmessage_channelid_label.textContent = "Channel: #"+arr.name;
        sendmessage_message_div.style.display = "block";
        sendmessage_savemessage.addEventListener("click", submitMessageToSend);
    };
}

const submitMessageToSend = () => {
    var request = new XMLHttpRequest();
    request.open("POST", "/sendmessagetochannel", true);
    request.setRequestHeader("Content-type", "application/json");
    var param = JSON.stringify({"serverid": sendmessage_serverid.value, "channelid" : sendmessage_channelid.value, "content": sendmessage_message.value});
    request.send(param);
    request.onload = function() {
        var info = this.responseText;
        var arr = JSON.parse(info);
        if (arr.code && arr.message) {
            returnResponse("error", "[SendMessage] "+arr.name+"<br>"+arr.message);
            return;
        }
        returnResponse("success", "[SendMessage] Message Sent!");
        sendmessage_message.value = "";
    };
}

var addbot_createlink = document.querySelector(".addbot_createlink");
var addbot_responsetxt = document.querySelector(".addbot_responsetxt");
addbot_createlink.addEventListener("click", () => {
    var req = new XMLHttpRequest();
    req.open("GET", "/getbotinfo", true);
    req.send();
    req.onload = function() {
        var clientid = this.responseText;
        addbot_responsetxt.style.display = "block";
        addbot_responsetxt.textContent = `https://discord.com/api/oauth2/authorize?client_id=${clientid}&permissions=8&scope=bot`;
        addbot_responsetxt.href = `https://discord.com/api/oauth2/authorize?client_id=${clientid}&permissions=8&scope=bot`;
    };
});