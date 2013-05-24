// include the library
const Dropbox = require('dropbox');
// access to the data folder
const data = require('self').data;

// start the dropbox process
var client = new Dropbox.Client({
    // update this key below
    key: "fkfp6wrap5sgt23", sandbox: true
});

// Set auth driver
client.authDriver(new Dropbox.AuthDriver.Firefox({ rememberUser: true }));

function login() {
    client.authenticate(function (error, client) {
        client.getUserInfo(function (error, userInfo) {
            if (error) {
                console.log(error);
            }
            //console.log("Hello, " + userInfo.name + "!");
            dropboxPanel.port.emit("ready");
            dropboxPanel.port.emit("name", {name: userInfo.name});
            dropboxPanel.show();
        });
    });
}

login();

// create a new panel that shows an upload form
var dropboxPanel = require("sdk/panel").Panel({
    width: 280,
    height: 280,
    contentURL: data.url('panel.html'),
    // content script that will be attached
    contentScriptFile: data.url("panel.js")
});

dropboxPanel.port.on("writeFile", function() {
    client.writeFile(new Date().getUTCFullYear() + ".txt", new Date().getTime(), function(error, stat) {
        if (error) {
            console.log(error);  // Something went wrong.
            return;
        }
        dropboxPanel.port.emit("wroteFile");
    });
});

dropboxPanel.port.on("readFile", function() {
    client.readFile(new Date().getUTCFullYear() + ".txt", function(error, stat) {
        if (error) {
            console.log(error);  // Something went wrong.
            return;
        }
        dropboxPanel.port.emit("readFile");
    });
});

dropboxPanel.port.on("listFiles", function() {
    client.readdir("/", function(error, files) {
        if (error) {
            console.log(error);  // Something went wrong.
            return;
        }
        dropboxPanel.port.emit("listFiles", {files: files.length});
    });
});



dropboxPanel.port.on("logout", function() {
    client.signOut();
});

dropboxPanel.port.on("login", function() {
    dropboxPanel.hide();
    login();
});


// a new widget that is in the bottom right corner
require("sdk/widget").Widget({
    id: "dropbox-icon",
    label: "Dropbox Widget",
    contentURL: data.url('favicon.ico'),
    panel: dropboxPanel
});
