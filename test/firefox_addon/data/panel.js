var main = document.getElementById("main");
var logout = document.getElementById("logout");
var login = document.getElementById("login");

logout.addEventListener("click", function() {
    main.innerHTML = "";
    self.port.emit("logout");
    logout.style.display = "none";
    login.style.display = "inline";
}, false);

login.addEventListener("click", function() {
    main.innerHTML = "";
    self.port.emit("login");
    login.style.display = "none";
}, false);

function writeMain(text) {
    main.innerHTML += text + "<br/>";
}

self.port.on("ready", function onPort() {
    login.style.display = "none";
    writeMain("Connected to Dropbox...");
});

self.port.on("name", function onPort(data) {
    writeMain("Welcome, " + data.name);
    writeMain("Writing a file...");
    self.port.emit("writeFile");
});

self.port.on("wroteFile", function onPort(data) {
    writeMain("Wrote a file to your Dropbox!");
    self.port.emit("readFile");
});

self.port.on("readFile", function onPort(data) {
    writeMain("Read that file from your Dropbox!");
    self.port.emit("listFiles");
});

self.port.on("listFiles", function onPort(data) {
    writeMain("You have " + data.files + " files in your app.");
    writeMain("Done.");
    logout.style.display = "inline";
});
