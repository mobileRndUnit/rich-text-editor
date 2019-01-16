#Rich-Text-Editor

A fully functional Rich Text Editor for both Android and iOS, based off the [ZSSRichTextEditor](https://github.com/wix/react-native-zss-rich-text-editor) project.

##Installation

Install module:
`npm i --save https://gregory.galushka@gitlab.intecracy.com/LabArchives/rich-text-editor.git`
`react-native link rich-text-editor`

Check your package.json and install if missed:
1) react-native-image-picker
`npm i --save react-native-image-picker@0.26.3`
`react-native link react-native-image-picker`

Check if not configured before:
	https://github.com/react-community/react-native-image-picker
	https://github.com/wix/react-native-webview-bridge

##Android bug

1. Each time after creating the bundles, delete the file `node_modules_reactnativezssrichtexteditor_src_editor.html` in the folder `project_folder/android/app/src/main/res/drawable-mdpi`
2. Build and run project
##

##Usage

```
  render() {
    return (
      <RichTextView
        style={styles.richText}
        content='<p>this is a new paragraph</p> <p>this is another new paragraph</p>'
        getContentFromPage={(content) => console.log(content)}
      />
    );
  }

 ```
