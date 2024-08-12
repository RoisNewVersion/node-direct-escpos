function createShortcut() {
  const path = require("path");
  const createDesktopShortcut = require("create-desktop-shortcuts");

  const pathToYourScript = path.join(process.cwd(), "main.js");
  const options = {
    name: "Direct Print",
    filePath: "nodemon",
    arguments: '" ' + pathToYourScript + '"',
  };

  const shortcutsCreated = createDesktopShortcut({
    windows: options,
    linux: options,
    // OSX shortcuts do not support arguments in shortcuts
    osx: {
      // REQUIRED: Path must exist
      filePath: "nodemon",
      // OPTIONAL: Defaults to the Desktop of the current user
      //   outputPath: "/home/some/folder",
      // OPTIONAL: defaults to the filePath file's name (without the extension)
      name: "My App Name",
      // OPTIONAL: defaults to false
      overwrite: false,
    },
  });

  if (shortcutsCreated) {
    console.log("Everything worked correctly!");
  } else {
    console.log(
      'Could not create the icon or set its permissions (in Linux if "chmod" is set to true, or not set)'
    );
  }
}
createShortcut();
