glob = require 'glob'

run = require './run'

fasttest = (callback) ->
  test_cases = glob.sync 'test/js/fast/**/*_test.js'
  test_cases.sort()  # Consistent test case order.
  run 'node node_modules/mocha/bin/mocha --colors --slow 200 --timeout 1000 ' +
      '--require test/js/helpers/fast_setup.js --reporter min ' +
      test_cases.join(' '), noExit: true, (code) ->
        callback(code) if callback

webtest = (callback) ->
  webFileServer = require '../test/js/helpers/web_file_server.js'
  if 'BROWSER' of process.env
    if process.env['BROWSER'] is 'false'
      url = webFileServer.testUrl()
      console.log "Please open the URL below in your browser:\n    #{url}"
    else
      webFileServer.openBrowser process.env['BROWSER']
  else
    webFileServer.openBrowser()
  callback() if callback?

module.exports.fast = fasttest
module.exports.web = webtest
