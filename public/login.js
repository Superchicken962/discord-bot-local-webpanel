const htmlreq = new XMLHttpRequest();

const getPresetToken = (callback) => {
    htmlreq.open("get", "/getlogininfo", true);
    htmlreq.send();
    htmlreq.onload = function() {
        var token = this.responseText;
        callback(token);
    }
}

var tokeninp = document.querySelector(".bottoken-inp");

getPresetToken((token) => {
    if (token == null || token == undefined || token == "false") {
        tokeninp.value = "";
        tokeninp.disabled = false;
        tokeninp.type = "password";
    } else {
        tokeninp.value = token.toString();
        // tokeninp.disabled = true;
        tokeninp.type = "text";
    }
});