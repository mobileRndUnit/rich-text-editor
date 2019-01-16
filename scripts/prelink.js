try {
  var fs = require('fs');
  var AndroidManifest = require('androidmanifest');
  var shell = require('shelljs');

  var PACKAGE_JSON = process.cwd() + '/package.json';
  var package = JSON.parse(fs.readFileSync(PACKAGE_JSON));
  var VERSION = checkVersion();
  var manifestFilePath = process.cwd() + '/android/app/src/main/AndroidManifest.xml';

  if(VERSION < 0.31) {
    console.log('You project version is '+ VERSION + ' which may not compatible to rich-text-editor (>= 0.31.0)');
    return;
  } else {
    // copy MathJax
    shell.cp('-R', process.cwd() + '/node_modules/rich-text-editor/src/MathJax', process.cwd() + '/android/app/src/main/assets/MathJax');

    // add to manifest permissions
    var manifest = new AndroidManifest().readFile(manifestFilePath);

    manifest
      .usesPermission('android.permission.CAMERA')
      .usesPermission('android.permission.WRITE_EXTERNAL_STORAGE');

    manifest.writeFile(manifestFilePath);

    return;
  }

  function checkVersion() {
    console.log('rich-text-editor checking app version ..');
    return parseFloat(/\d\.\d+(?=\.)/.exec(package.dependencies['react-native']));
  }

} catch(err) {
  console.log(
    '\033[95mrich-text-editor\033[97m link \033[91mFAILED \033[97m\nCould not automatically link package :'+
    err.stack)
}
