import React, { Component } from 'react';
import {
  ListView,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Keyboard,
  Platform,
  Text,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import { actions } from '../const';
import KeyboardSpacer from '../keyboardSpacer';
const displayWidth = Dimensions.get('window').width;
const displayHeight = Dimensions.get('window').height;
const PlatformIOS = Platform.OS === 'ios';
const leftArrow = require('../../img/icon_left_arrow.png');
import PropTypes from 'prop-types';

export default class TableView extends Component {

  static propTypes = {
    getEditor: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      editor: undefined,
      orientation: 'PORTRAIT',
      width: displayWidth,
      countRows: '',
      countColumn: '',
      caption: ''
    };
  }

  componentDidMount() {
    const editor = this.props.getEditor();
    if (!editor) {
      throw new Error('Toolbar has no editor!');
    } else {
      this.setState({ editor });
    }
  }

  _onLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    const orientation = (width > height) ? 'LANDSCAPE' : 'PORTRAIT';
    this.setState({ orientation, width });
  }

  createTable = (countRows, countColumn, caption) => {
    const { editor } = this.state;
    let htmlTable = `<table cols="${countColumn}" border="1" style="width: ${displayWidth}">`;

    if (caption.length > 0) {
      htmlTable = htmlTable.concat(`<caption>${caption}</caption>`);
    }
    for (let indexRows = 0; indexRows < countRows; indexRows++) {
      htmlTable = htmlTable.concat(`<tr>`);
      for (let indexColumn = 0; indexColumn < countColumn; indexColumn++) {
        htmlTable = htmlTable.concat(`<td style="font-size: 14px;" width=35px height=15px valign="top"></td>`);
      }
      htmlTable = htmlTable.concat(`</tr>`);
    }
    htmlTable = htmlTable.concat('</table>');
    this.props.hideTableModal(htmlTable);
  }

  // createTable = (countRows, countColumn, caption) => {
  //   const { editor } = this.state;
  //   this.props.hideTableModal();
  //   if (!this.props.isSelectionActive && !PlatformIOS) {
  //     editor._sendAction(actions.focusEditor, 'zss_editor_content');
  //   }
  //   if (countRows > 0 && countColumn > 0) {
  //     let htmlTable = `<table cols="${countColumn}" border="1" style="width: ${displayWidth}">`;
  //     if (caption.length > 0) {
  //       htmlTable = htmlTable.concat(`<caption>${caption}</caption>`);
  //     }
  //     for (let indexRows = 0; indexRows < countRows; indexRows++) {
  //       htmlTable = htmlTable.concat(`<tr>`);
  //       for (let indexColumn = 0; indexColumn < countColumn; indexColumn++) {
  //         htmlTable = htmlTable.concat(`<td style="font-size: 14px;" width=35px height=15px></td>`);
  //       }
  //       htmlTable = htmlTable.concat(`</tr>`);
  //     }
  //     htmlTable = htmlTable.concat('</table>');
  //     editor._sendAction(actions.insertTable, htmlTable);

  //     if (!this.props.isSelectionActive) {
  //       editor._sendAction(actions.focusEditor, 'zss_editor_content');
  //     } else {
  //       editor._sendAction(actions.restoreSelection);
  //     }
  //   } else {
  //     this.props.hideTableModal();
  //   }
  // }

  submit = () => {
    if (this.state.countRows.length > 0 && this.state.countColumn.length > 0) {
      const countRows = Number(this.state.countRows);
      const countColumn = Number(this.state.countColumn);
      // if (PlatformIOS) {
      this.createTable(countRows, countColumn, '');
      // } else {
      //   this.createTable(countRows, countColumn, '');
      // }
    }
  }

  doneButtonPress = (e) => {
    if (e.nativeEvent.key == "Enter") {
      this.submit();
    }
  }

  checkNumber = (key, str) => {
    const num = parseInt(str);
    if (num >= 1 && num <= 99) {
      this.setState({ [key]: String(num) });
    } else {
      this.setState({ [key]: '' });
    }
  }

  focusRows = () => {
    if (this.refs.rows) {
      this.refs.rows.focus();
    }
  }

  render() {
    const { orientation } = this.state;

    return (
      <View style={{ flex: 1, justifyContent: 'flex-end' }} onLayout={this._onLayout}>
        <TouchableWithoutFeedback onPress={() => this.props.hideTableModal()}>
          <View style={{ flex: 1 }} />
        </TouchableWithoutFeedback>
        <View style={styles.mainContainer} >
          <View style={styles.topContainer}>
            <TouchableOpacity style={styles.back} onPress={() => this.props.hideTableModal()}>
              <Image
                source={leftArrow}
                style={styles.leftArrow}
                resizeMode={'contain'}
              />
              <Text style={styles.whiteText}>Add table</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.back} onPress={() => this.submit()}>
              <Text style={styles.whiteText}>Done</Text>
            </TouchableOpacity>
          </View>
          <View>
            <View style={styles.inputContainer}>
              <Text style={{ marginLeft: 15, fontSize: 14, width: 55 }}>Rows:</Text>
              <TextInput
                ref="rows"
                value={this.state.countRows}
                style={styles.input}
                onChangeText={(text) => this.checkNumber('countRows', text)}
                underlineColorAndroid={'transparent'}
                keyboardType="numeric"
              />
              <View style={{ width: 15, height: 40 }} />
            </View>
            <View style={styles.inputContainer}>
              <Text style={{ marginLeft: 15, fontSize: 14, width: 55 }}>Column:</Text>
              <TextInput
                ref="columns"
                value={this.state.countColumn}
                style={styles.input}
                onChangeText={(text) => this.checkNumber('countColumn', text)}
                underlineColorAndroid={'transparent'}
                returnKeyType='done'
                keyboardType="numeric"
                onKeyPress={(e) => this.doneButtonPress(e)}
              />
              <View style={{ width: 15, height: 40 }} />
            </View>
          </View>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
        </View>
        {
          (Platform.OS === 'ios') &&
          <KeyboardSpacer />
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    height: 300,
    backgroundColor: '#fff',
  },
  topContainer: {
    height: 50,
    backgroundColor: 'rgb(122, 57, 150)',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
    paddingRight: 15,
  },
  leftArrow: {
    width: 15,
    height: 30,
    marginRight: 10,
  },
  whiteText: {
    color: 'white',
    fontSize: 17,
  },
  back: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  input: {
    flex: 1,
    height: 40,
    marginLeft: 10,
    borderWidth: 1,
    paddingLeft: 15,
    fontSize: 15,
  },
  defaultUnselectedButton: {}
});
