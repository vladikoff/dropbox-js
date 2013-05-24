var Dropbox = require("./dropbox");

var system = require("sdk/system");

exports["test produces the credentials passed to storeCredentials"] = function(assert, done) {
    var client = new Dropbox.Client(system.staticArgs);
    var driver1 = new Dropbox.AuthDriver.Firefox({
        scope: 'some_scope'
    });
    var driver2 = new Dropbox.AuthDriver.Firefox({
        scope: 'some_scope'
    });

    var cred1 = client.credentials();
    driver1.storeCredentials(cred1, function() {
        driver2.loadCredentials(function(cred2) {
            assert.deepEqual(cred1, cred2, "equivalent credentials");
            done();
        });
    });
};

exports["test produces null after forgetCredentials was called"] = function(assert, done) {
    var client = new Dropbox.Client(system.staticArgs);
    var driver = new Dropbox.AuthDriver.Firefox({
        scope: 'some_scope'
    });

    driver.forgetCredentials(function() {
        driver.loadCredentials(function(creds) {
            assert.equal(creds, null, "credentials are null");
            done();
        });
    });
};

exports["test produces null if a different scope is provided"] = function(assert, done) {
    var client = new Dropbox.Client(system.staticArgs);
    var driver1 = new Dropbox.AuthDriver.Firefox({
        scope: 'some_scope'
    });

    driver1.storeCredentials(client.credentials(), function() {
        var driver2 = new Dropbox.AuthDriver.Firefox({
            scope: 'other_scope'
        });
        driver2.loadCredentials(function(credentials) {
            assert.ok(credentials == null, "credentials are null");
            done();
        });
    });
};

exports["test integration"] = function(assert, done) {
    var client = new Dropbox.Client(system.staticArgs);
    client.reset();

    var driver = new Dropbox.AuthDriver.Firefox({
        scope: 'firefox_integration'
    });
    client.authDriver(driver);

    driver.forgetCredentials(function() {
        client.authenticate(function(error, client) {
            assert.ok(error == null, "no authenticate error");
            assert.equal(client.authStep, Dropbox.Client.DONE, "equal auth state");

            client.getUserInfo(function(error, userInfo) {
                assert.ok(error == null, "no user info error");
                assert.equal(client.authStep, Dropbox.Client.DONE, "equal auth state");
                assert.ok(userInfo instanceof Dropbox.AccountInfo, "userInfo instance ok");

                client.reset();
                client.authenticate({
                    interactive: false
                }, function(error, client) {
                    assert.ok(error == null, "no authenticate error");
                    assert.equal(client.authStep, Dropbox.Client.DONE, "equal auth state");
                    assert.ok(client.isAuthenticated(), "isAuthenticated");

                    client.getUserInfo(function(error, userInfo) {
                        assert.ok(error == null, "no user info error");
                        assert.ok(userInfo instanceof Dropbox.AccountInfo, "userInfo instance ok");
                        done();
                    });
                });
            });
        });
    });

};

require("sdk/test").run(exports);
