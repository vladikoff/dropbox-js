# firefox-addon sample

This sample add-on shows a small Panel popup that performs Dropbox actions. If the panel disappears,
you can always get it back by pressing the Dropbox icon in the bottom right corner.

## Development Setup

* [Download Add-on SDK](https://addons.mozilla.org/en-US/developers/docs/sdk/latest/dev-guide/tutorials/installation.html)
* Run `cake firefox` to build the addon
* Change the Dropbox API key if needed inside of `main.js`
* You can manually run `cfx run --profiledir="~/addon-dev/profiles/tester"` for saving browser profiles
This will open Firefox and run the add-on in a saved profile.

## Notes

You can login / logout. To test in different versions of Firefox use `-b`.
For example to run this in Firefox Aurora use:
`cfx run -b /Applications/FirefoxAurora.app/Contents/MacOS/firefox --profiledir ~/addon-dev/profiles/tester`
