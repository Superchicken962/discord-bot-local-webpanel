var maindiv = document.querySelector(".update_info_div");
var loadingdiv = document.querySelector(".checkingforupdates-temp");

var req = new XMLHttpRequest();
req.open("get", "/checkforupdates", true);
req.setRequestHeader("Content-type", "application/json");
req.send();
req.onload = function() {
    loadingdiv.remove();
    var res = this.responseText;
    if (res !== "true") {
        var obj = JSON.parse(res);
        var infoholder = document.createElement("div");
        infoholder.classList.add("updates_info_holder");
        var date = new Date(parseInt(obj.date)*1000);
        var datestring = date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear();
        var timestring = date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
        obj.info = obj.info.replaceAll("{n}", "<br>");
        if (obj.isLatest === false) {
            infoholder.innerHTML = "<h1>Update Available!</h1><h2><span title='Your version'>"+obj.currentVer+"</span> => <span title='New version'>"+obj.version+"</span></h2><h3>["+datestring+"]<br>"+obj.info+"</h3><p>Download from the github repository <a href='https://discordbotpanel.cf/githubrepo' target='_blank'>here</a></p><br><a href='../dashboard'>return to dashboard</a>";
            maindiv.append(infoholder);
        } else if (obj.isLatest === "over") {
            infoholder.innerHTML = "<h1>Update Available!</h1><h2>But apparently not for you...<br><span title='Your version'>"+obj.currentVer+"</span> => <span title='New version'>"+obj.version+"</span></h2><h3>["+datestring+"]<br>"+obj.info+"</h3><p>It seems that your version is newer than the 'new' version. Either you are a time traveling genius, or you just changed the version value in the code. Either way, which ever you did... NERD!!!<br><br>Download from the github repository <a href='https://discordbotpanel.cf/githubrepo' target='_blank'>here</a></p><br><a href='../dashboard'>return to dashboard</a>";
            maindiv.append(infoholder);
        }
    } else {
        var infoholder = document.createElement("div");
        infoholder.classList.add("updates_info_holder");
        infoholder.innerHTML = "<h1>All Up to Date!</h1><p>No Updates Available</p><br><a href='../dashboard'>return to dashboard</a>";
        maindiv.append(infoholder);
    }
}