import React, { Component,
   // PropTypes 
 } from 'react';
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
  TouchableWithoutFeedback
} from 'react-native';
import { actions } from './const';
import TextEditRow from './panel_rows/TextEditRow';
import FontEditRow from './panel_rows/FontEditRow';
import HeadingEditRow from './panel_rows/HeadingEditRow';
import ColorEditRow from './panel_rows/ColorEditRow';
import PropTypes from 'prop-types';


const displayWidth = Dimensions.get('window').width;
const displayHeight = Dimensions.get('window').height;
const PlatformIOS = Platform.OS === 'ios';

const leftArrow = require('../img/icon_left_arrow.png');

const typeActions = [
  'textEdit',
  'heading',
  'fonts',
  'textColor',
  'highlightColor'
];

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

export default class RichTextPanel extends Component {

  static propTypes = {
    getEditor: PropTypes.func.isRequired,
    onPressAddLink: PropTypes.func,
    onPressAddImage: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this._onPress = this._onPress.bind(this);
    this.state = {
      editor: undefined,
      ds: new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }).cloneWithRows(typeActions),
      dataSource: typeActions,
      orientation: 'PORTRAIT',
      typeActions: typeActions,
      width: displayWidth,
    };
  }

  componentDidMount() {
    const editor = this.props.getEditor();
    if (!editor) {
      throw new Error('Toolbar has no editor!');
    } else {
      this.setState({ editor: editor });
    }
  }

  renderRows = (row, rowID, rowSection) => {
    return (
      <View style={{ flex: 1, }}>
        {
          (rowSection == 0) ?
            <TextEditRow
              onPress={this._onPress}
            />
            : (rowSection == 1) ?
              <HeadingEditRow
                onPress={this._onPress}
              />
              : (rowSection == 2) ?
                <FontEditRow
                  onPress={this._onPress}
                />
                : (rowSection == 3) ?
                  <ColorEditRow
                    title='Text Color'
                    text
                    onPress={this._onPress}
                  />
                  : (rowSection == 4) &&
                  <ColorEditRow
                    title='Highlight Color'
                    highlight
                    onPress={this._onPress}
                  />
        }

        <View style={[styles.separator, { width: this.state.width }]} />
      </View>
    );
  }

  _onPress = (action, data) => {
    switch (action) {
      case actions.setBold:
      case actions.setItalic:
      case actions.insertBulletsList:
      case actions.insertOrderedList:
      case actions.setUnderline:
      case actions.heading1:
      case actions.heading2:
      case actions.heading3:
      case actions.heading4:
      case actions.heading5:
      case actions.heading6:
      case actions.setParagraph:
      case actions.removeFormat:
      case actions.alignLeft:
      case actions.alignCenter:
      case actions.alignRight:
      case actions.alignFull:
      case actions.setSubscript:
      case actions.setSuperscript:
      case actions.setStrikethrough:
      case actions.setHR:
      case actions.setIndent:
      case actions.setOutdent:
      case actions.setHR:
        this.state.editor._sendAction(action);
        break;
      case actions.insertLink:
        this.state.editor.prepareInsert();
        if (this.props.onPressAddLink) {
          this.props.onPressAddLink();
        } else {
          this.state.editor.getSelectedText().then(selectedText => {
            this.state.editor.showLinkDialog(selectedText);
          });
        }
        break;
      case actions.insertImage:
        this.state.editor.prepareInsert();
        if (this.props.onPressAddImage) {
          this.props.onPressAddImage();
        }
        break;
      case actions.setTextColor:
        this.props.changeColor(data);
        break;
      case actions.setBackgroundColor:
      case actions.setFontFamily:
        this.state.editor._sendAction(action, data);
        break;
        break;
    }
    this.props.hideTextPanel();
  }

  _onLayout = (event) => {
    // console.warn('layout', event.nativeEvent.layout);
    const { width, height } = event.nativeEvent.layout;
    const orientation = (width > height) ? 'LANDSCAPE' : 'PORTRAIT';
    this.setState({ orientation, width });

    this.setState(() => ({ typeActions: [] }));
    this.setState(() => ({ typeActions: typeActions }));
  };

  render() {
    const { orientation } = this.state;

    return (
      <View style={{ flex: 1, justifyContent: 'flex-end' }} onLayout={this._onLayout}>
        <TouchableWithoutFeedback onPress={() => this.props.hideTextPanel()}>
          <View style={{ flex: 1 }} />
        </TouchableWithoutFeedback>
        <View style={styles.mainContainer} >
          <View style={styles.topContainer}>
            <TouchableOpacity style={styles.back} onPress={() => this.props.hideTextPanel()}>
              <Image
                source={leftArrow}
                style={styles.leftArrow}
                resizeMode={'contain'}
              />
              <Text style={styles.whiteText}>Text/Paragraph</Text>
            </TouchableOpacity>
          </View>
          <ListView
            scrollEnabled={false}
            enableEmptySections
            contentContainerStyle={{ flex: 1, }}
            // dataSource={this.state.ds}
            dataSource={ds.cloneWithRows(this.state.typeActions)}
            renderRow={(row, rowID, rowSection) => this.renderRows(row, rowID, rowSection)}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    // position: 'absolute',
    // top: (PlatformIOS) ? displayHeight - 300 : displayHeight - 320,
    // left: 0,
    // width: displayWidth,
    // flex: 1,
    height: 300,
    backgroundColor: '#fff',
  },
  topContainer: {
    // width: displayWidth,
    height: 50,
    backgroundColor: 'rgb(122, 57, 150)',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingLeft: 15,
  },
  dropDownContainer: {
    flex: 1,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 15,
  },
  leftArrow: {
    width: 15,
    height: 30,
    marginRight: 10,
  },
  downArrow: {
    width: 30,
    height: 15,
    marginRight: 10,
  },
  whiteText: {
    color: 'white',
    fontSize: 17,
  },
  mainRows: {
    // width: displayWidth,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalSeparator: {
    width: 1,
    height: 40,
    backgroundColor: 'rgb(122, 57, 150)'
  },
  back: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  separator: {
    width: displayWidth,
    height: 1,
    backgroundColor: 'black'
  },
  defaultSelectedButton: {
    backgroundColor: 'red'
  },
  defaultUnselectedButton: {}
});
