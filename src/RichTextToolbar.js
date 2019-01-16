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
  Alert
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconArrow from 'react-native-vector-icons/Ionicons';
import { actions } from './const';
import PropTypes from 'prop-types';

const displayWidth = Dimensions.get('window').width;
const PlatformIOS = Platform.OS === 'ios';

const defaultActions = [
  actions.setBold,
  actions.setItalic,
  actions.setUnderline,
  actions.setStrikethrough,
  actions.setSubscript,
  actions.setSuperscript,
  actions.insertImage,
  actions.insertData,
  actions.insertHTML,
  actions.insertData,
];

const icons = ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', 'image', 'formula', 'table', 'font'];

class RichTextToolbar extends Component {

  static propTypes = {
    getEditor: PropTypes.func.isRequired,
    actions: PropTypes.array,
    onPressAddLink: PropTypes.func,
    onPressAddImage: PropTypes.func,
    selectedButtonStyle: PropTypes.object,
    iconTint: PropTypes.any,
    selectedIconTint: PropTypes.any,
    unselectedButtonStyle: PropTypes.object,
    renderAction: PropTypes.func,
    iconMap: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this._onKeyboardDidHide = this._onKeyboardDidHide.bind(this);
    const actions = defaultActions;
    this.scroll;
    this.x = 0;
    this.scrollWidth = displayWidth;
    this.moveTo = 50;
    this.state = {
      editor: undefined,
      isShowLeftArrow: true,
      isShowRightArrow: true,
      actions,
      ds: new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }).cloneWithRows(this.getRows(actions, []))
    };
  }

  componentDidReceiveProps(newProps) {
    const actions = newProps.actions ? newProps.actions : defaultActions;
    this.setState({
      actions,
      ds: this.state.ds.cloneWithRows(this.getRows(actions, this.state.selectedItems))
    });
  }

  goForward() {
    (this.x > 0 && this.x + this.moveTo + displayWidth > this.scrollWidth) ?
      this.scroll.scrollToEnd({ animated: true })
      :
      this.scroll.scrollTo({ x: this.x + this.moveTo, y: 0, animated: true });
  }

  goBack() {
    const x = (this.x - this.moveTo < 0) ? 0 : this.x - this.moveTo;
    this.scroll.scrollTo({ x, y: 0, animated: true });
  }

  getRows(actions, selectedItems) {
    return actions.map((action) => { return { action, selected: selectedItems.includes(action) }; });
  }

  componentWillMount() {
    if (PlatformIOS) {
      this.keyboardEventListeners = [
        Keyboard.addListener('keyboardDidHide', this._onKeyboardDidHide)
      ];
    } else {
      this.keyboardEventListeners = [
        Keyboard.addListener('keyboardDidHide', this._onKeyboardDidHide)
      ];
    }
  }

  _onKeyboardDidHide(event) {
    // this.props.showTextPanel();
  }

  componentDidMount() {
    const editor = this.props.getEditor();
    if (!editor) {
      throw new Error('Toolbar has no editor!');
    } else {
      this.setState({ editor });
    }
  }

  componentWillUnmount() {
    this.keyboardEventListeners.forEach((eventListener) => eventListener.remove());
  }

  setSelectedItems(selectedItems) {
    if (selectedItems !== this.state.selectedItems) {
      this.setState({
        selectedItems,
        ds: this.state.ds.cloneWithRows(this.getRows(this.state.actions, selectedItems))
      });
    }
  }

  _getButtonIcon(action) {
    if (this.props.iconMap && this.props.iconMap[action]) {
      return this.props.iconMap[action];
    } else if (getDefaultIcon()[action]) {
      return getDefaultIcon()[action];
    } else {
      return undefined;
    }
  }

  pressButton = (action, rowSection) => {
    if (rowSection == defaultActions.length - 1) {
      this.props.showTextPanel();
    } else if (defaultActions.length - 2 == rowSection) {
      this.props.showTableModal();
    } else if (defaultActions.length - 3 == rowSection) {
      // this.props.hideMathView();
      this.props.showMathView(false);
    } else if (defaultActions.length - 4 == rowSection) {
      this.state.editor._sendAction(actions.prepareInsert);
      this.state.editor._sendAction(actions.isSelectedNode);
      this.getPhotoFromDevice();
    } else {
      this._onPress(action);
    }
  }

  _defaultRenderAction(action, selected, rowSection) {
    const icon = icons[rowSection];
    return (
      <TouchableOpacity
        key={action}
        style={[
          { height: 50, width: displayWidth / 9, justifyContent: 'center', flexDirection: 'row', alignItems: 'center', },
        ]}
        onPress={() => this.pressButton(action, rowSection)}
      >
        {(icon === 'font') && <View style={[styles.verticalSeparator, { marginRight: 10 }]} />}
        {
          (icon == 'formula') ?
            <Image
              source={require('../img/formula.png')}
              style={{ width: 27, height: 27, }}
              resizeMode='contain'
            />
            :
            <Icon
              name={icon}
              size={15}
              color='rgb(122, 57, 150)'
            />
        }
      </TouchableOpacity>
    );
  }

  _renderAction(action, selected, rowSection) {
    return this.props.renderAction ?
      this.props.renderAction(action, selected) :
      this._defaultRenderAction(action, selected, rowSection);
  }

  render() {
    return (
      <View
        style={styles.toolbarContainer}
      >
        <TouchableOpacity
          onPress={() => this.goBack()}
          style={styles.arrow}
        >
          {
            (this.state.isShowLeftArrow) &&
            <IconArrow name="ios-arrow-back" size={20} color='rgb(122, 57, 150)' />
          }
        </TouchableOpacity>
        <ListView
          ref={scroll => this.scroll = scroll}
          onScroll={event => {
            this.x = event.nativeEvent.contentOffset.x;
            this.scrollWidth = event.nativeEvent.contentSize.width;
          }}
          horizontal
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          alwaysBounceVertical={false}
          alwaysBounceHorizontal={false}
          contentContainerStyle={{ flexDirection: 'row' }}
          dataSource={this.state.ds}
          renderRow={(row, rowID, rowSection) => this._renderAction(row.action, row.selected, rowSection)}
        />
        <TouchableOpacity
          onPress={() => this.goForward()}
          style={styles.arrow}
        >
          {
            (this.state.isShowRightArrow) &&
            <IconArrow name="ios-arrow-forward" size={20} color='rgb(122, 57, 150)' />
          }
        </TouchableOpacity>
      </View>
    );
  }


  getPhotoFromDevice() {
    const options = {
      storageOptions: {
        skipBackup: true,
      },
      quality: Platform.OS === 'ios' ? 5 : 1,
      maxWidth: 500,
      maxHeight: 500,
    };
    ImagePicker.showImagePicker(options, (response) => {
      if (!response.didCancel && !response.error && !response.customButton) {
        const source = { uri: '' + response.data, isStatic: true };
        const images = [source].map((image) => {
          let imageBase64String = image.uri;
          const alt = '';
          if (!this.props.isSelectionActive && !PlatformIOS) {
            this.state.editor._sendAction(actions.focusEditor, 'zss_editor_content');
          }
          this._onPress(actions.insertImageBase64String, { imageBase64String, alt });
          if (!this.props.isSelectionActive) {
            this.state.editor._sendAction(actions.focusEditor, 'zss_editor_content');
          } else {
            this.state.editor._sendAction(actions.restoreSelection);
          }
        });
      }
    });
  }

  _onPress(action, data) {
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
      case actions.insertHTML:
        this.state.editor._sendAction(action, data);
        break;
      case actions.insertImageBase64String:
        this.state.editor._sendAction(action, data);
        break;
        break;
    }
  }
}

export const HEIGHT = 50;

export default RichTextToolbar;

const styles = StyleSheet.create({
  toolbarContainer: {
    height: HEIGHT,
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgb(122, 57, 150)',
    flexDirection: 'row',
  },
  verticalSeparator: {
    width: 1,
    height: 40,
    backgroundColor: 'rgb(122, 57, 150)'
  },
  defaultSelectedButton: {
    backgroundColor: 'red'
  },
  arrow: {
    width: 20,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultUnselectedButton: {}
});
