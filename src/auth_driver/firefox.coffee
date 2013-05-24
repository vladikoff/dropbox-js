# OAuth driver for Firefox add-ons, uses the add-on SDK
class Dropbox.AuthDriver.Firefox extends Dropbox.AuthDriver.BrowserBase
  # Sets up a Firefox add-on OAuth driver.
  #
  # @param {?Object} options one of the settings below; leave out the argument
  #   to use the current location for redirecting
  # @option options {Boolean} rememberUser if true, the user's OAuth tokens are
  #   saved in localStorage; if you use this, you MUST provide a UI item that
  #   calls signOut() on Dropbox.Client, to let the user "log out" of the
  #   application
  constructor: (options) ->
    # Due to security restrictions of the JetPack SDK, the page cannot redirect back
    # to the add-on. The driver solves this problem using the tab api flow.
    if not options?
      options = {}
    super options
    @receiverUrl = "about:blank"
    @ss = require("sdk/simple-storage")
    @storageKey = "dropbox_js_#{@scope}_credentials"

  # Saves token information when appropriate.
  onAuthStateChange: (client, callback) ->
    @setStorageKey client
    switch client.authState
      when Dropbox.Client.RESET
        @loadCredentials (credentials) =>
          if credentials
            if credentials.authState
              # Stuck authentication process, reset.
              return @forgetCredentials(callback)
            client.setCredentials credentials
          callback()
      when Dropbox.Client.DONE
        @storeCredentials client.credentials(), callback
      when Dropbox.Client.SIGNED_OUT
        @forgetCredentials callback
      when Dropbox.Client.ERROR
        @forgetCredentials callback
      else
        callback()

  # Deletes information previously stored by a call to storeCredentials.
  #
  # @private
  # onAuthStateChange calls this method during the authentication flow.
  #
  # @param {function()} callback called after the credentials are deleted
  # @return {Dropbox.Drivers.BrowserBase} this, for easy call chaining
  forgetCredentials: (callback) ->
    if @ss.storage.credentials and @ss.storage.credentials[@storageKey]
      @ss.storage.credentials[@storageKey] = null
    callback()

  # Retrieves a token and secret from sdk/simple-storage storage.
  #
  # @private
  # onAuthStateChange calls this method during the authentication flow.
  #
  # @param {function(?Object)} callback supplied with the credentials object
  #   stored by a previous call to
  #   Dropbox.Drivers.BrowserBase#storeCredentials; null if no credentials were
  #   stored, or if the previously stored credentials were deleted
  # @return {Dropbox.Drivers.BrowserBase} this, for easy call chaining
  loadCredentials: (callback) ->
    if @ss.storage.credentials?
      callback(@ss.storage.credentials[@storageKey])
    else
      callback(null)


  # Stores a Dropbox.Client's credentials to sdk/simple-storage storage.
  #
  # @private
  # onAuthStateChange calls this method during the authentication flow.
  #
  # @param {Object} credentials the result of a Drobpox.Client#credentials call
  # @param {function()} callback called when the storing operation is complete
  # @return {Dropbox.Drivers.BrowserBase} this, for easy call chaining
  storeCredentials: (credentials, callback) ->
    if not @ss.storage.credentials?
      @ss.storage.credentials = {}

    @ss.storage.credentials[@storageKey] = credentials
    callback()

  # Shows the authorization URL in a tab, waits for it to return to about:blank.
  doAuthorize: (authUrl, token, tokenSecret, callback) ->
    tabs = require("tabs");
    data = require("self").data;
    tabs.open
      url: authUrl,
      onReady: onReady = (tab) ->
        if tab.url.indexOf('about:blank#') is 0
          path = "oauth_receiver.html#" + tab.url.split("#")[1]
          callback Dropbox.Util.Oauth.queryParamsFromUrl(path)
          tab.close()

  # URL of the redirect receiver page, which posts a message back to this page.
  url: () ->
    @receiverUrl

  # Communicates with the pageMopd flow from the OAuth receiver page.
  @oauthReceiver: (path) ->
    this.onMessage.dispatch(path)

  # postMessage for oauthReceiver
  @onMessage = new Dropbox.Util.EventSource
