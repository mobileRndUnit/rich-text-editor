import React, { Component,
   // PropTypes 
 } from 'react';
import WebViewBridge from 'react-native-webview-bridge';
import CookieManager from 'labarchives-cookies';
import { InjectedMessageHandler } from './WebviewMessageHandler';
import { actions, messages } from './const';
import { Button, ScrollView, Modal, View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, PixelRatio, Keyboard, Dimensions, Image } from 'react-native';
import ModalDropdown from './dropdown';
import PropTypes from 'prop-types';

import { HEIGHT as ToolbarHeight } from './RichTextToolbar';

const injectScript = `
  (function () {
    ${InjectedMessageHandler}
  }());
`;
const displayWidth = Dimensions.get('window').width;
const displayHeight = Dimensions.get('window').height;
const PlatformIOS = Platform.OS === 'ios';
const downArrow = require('../img/icon_down_arrow.png');

export default class RichTextEditor extends Component {
  static propTypes = {
    initialTitleHTML: PropTypes.string,
    initialContentHTML: PropTypes.string,
    titlePlaceholder: PropTypes.string,
    contentPlaceholder: PropTypes.string,
    editorInitializedCallback: PropTypes.func,
    customCSS: PropTypes.string,
    hiddenTitle: PropTypes.bool,
    enableOnChange: PropTypes.bool,
    footerHeight: PropTypes.number,
    contentInset: PropTypes.object,
    showKeyboardAtFirst: PropTypes.bool,
  };

  static defaultProps = {
    contentInset: {},
    style: {},
    showKeyboardAtFirst: true,
  };

  constructor(props) {
    super(props);
    this._sendAction = this._sendAction.bind(this);
    this.registerToolbar = this.registerToolbar.bind(this);
    this.onBridgeMessage = this.onBridgeMessage.bind(this);
    this._onKeyboardWillShow = this._onKeyboardWillShow.bind(this);
    this._onKeyboardWillHide = this._onKeyboardWillHide.bind(this);


    this.count = 6;

    this.state = {
      selectionChangeListeners: [],
      onChange: [],
      showLinkDialog: false,
      showFormulaDialog: false,
      linkInitialUrl: '',
      linkTitle: '',
      linkUrl: '',
      keyboardHeight: 0,
      caption: '',
      countRows: 0,
      countColumn: 0,
      isSendDataToWebView: false,
    };
    this._selectedTextChangeListeners = [];
  }

  componentWillMount() {
    if (this.props.auth) {
      const domain = this.props.auth.domain.match(/^https:\/\/(.*)/);

      CookieManager.set({
        name: this.props.auth.name,
        value: this.props.auth.value,
        domain: domain[1],
        origin: domain[1],
        path: this.props.auth.path,
        version: '1',
        expiration: '2019-06-15T10:16:30.000Z', // 2019-06-15T10:16:30.000Z
      }, (err, res) => {
        console.log(err);
        console.log(res);
      });
    }
    if (PlatformIOS) {
      this.keyboardEventListeners = [
        Keyboard.addListener('keyboardWillShow', this._onKeyboardWillShow),
        Keyboard.addListener('keyboardWillHide', this._onKeyboardWillHide)
      ];
    } else {
      this.keyboardEventListeners = [
        Keyboard.addListener('keyboardDidShow', this._onKeyboardWillShow),
        Keyboard.addListener('keyboardDidHide', this._onKeyboardWillHide)
      ];
    }
  }

  componentWillUnmount() {
    this.keyboardEventListeners.forEach((eventListener) => eventListener.remove());
  }

  _onKeyboardWillShow(event) {
    const newKeyboardHeight = event.endCoordinates.height;
    if (this.state.keyboardHeight === newKeyboardHeight) {
      return;
    }
    if (newKeyboardHeight) {
      this.setEditorAvailableHeightBasedOnKeyboardHeight(newKeyboardHeight);
    }
    this.setState({ keyboardHeight: newKeyboardHeight });
  }

  _onKeyboardWillHide(event) {
    this.setState({ keyboardHeight: 0 });
  }

  setEditorAvailableHeightBasedOnKeyboardHeight(keyboardHeight) {
    const { top = 0, bottom = 0 } = this.props.contentInset;
    const { marginTop = 0, marginBottom = 0 } = this.props.style;
    const spacing = marginTop + marginBottom + top + bottom;

    let editorAvailableHeight = Dimensions.get('window').height - keyboardHeight - spacing;
    if (PlatformIOS) {
      editorAvailableHeight = editorAvailableHeight - ToolbarHeight - this.props.headerHeight;
    }
    this.setEditorHeight(editorAvailableHeight);
  }

  logs = (message) => {
    // console.warn('FROM ZSS', message, message.data);
  }

  formulaTouched = (message) => {
    // console.warn('formula', message.id, message.data);
    // if (PlatformIOS) {
    this.showFormulaDialog(message.data, message.id);
    // }
  }

  titleHtmlResponse = (message) => {
    if (this.titleResolve) {
      this.titleResolve(message.data);
      this.titleResolve = undefined;
      this.titleReject = undefined;
      if (this.pendingTitleHtml) {
        clearTimeout(this.pendingTitleHtml);
        this.pendingTitleHtml = undefined;
      }
    }
  }

  titleTextResponse = (message) => {
    if (this.titleTextResolve) {
      this.titleTextResolve(message.data);
      this.titleTextResolve = undefined;
      this.titleTextReject = undefined;
      if (this.pendingTitleText) {
        clearTimeout(this.pendingTitleText);
        this.pendingTitleText = undefined;
      }
    }
  }

  contentHtmlResponse = (message) => {
    // alert('CONTENT_HTML_RESPONSE');

    // console.warn('CONTENT_HTML_RESPONSE', message.data);
    if (this.contentResolve) {
      this.contentResolve(message.data);
      this.contentResolve = undefined;
      this.contentReject = undefined;
      if (this.pendingContentHtml) {
        clearTimeout(this.pendingContentHtml);
        this.pendingContentHtml = undefined;
      }
    } else {
      // console.warn(message.data);
    }
  }

  selectedTextResponse = (message) => {
    if (this.selectedTextResolve) {
      this.selectedTextResolve(message.data);
      this.selectedTextResolve = undefined;
      this.selectedTextReject = undefined;
      if (this.pendingSelectedText) {
        clearTimeout(this.pendingSelectedText);
        this.pendingSelectedText = undefined;
      }
    }
  }

  zssInitialized = (message) => {
    if (this.props.customCSS) {
      this.setCustomCSS(this.props.customCSS);
    }
    this.setTitlePlaceholder(this.props.titlePlaceholder);
    this.setContentPlaceholder(this.props.contentPlaceholder);
    this.setTitleHTML(this.props.initialTitleHTML);

    // let decodeHtml = "";
    // try {
    //   decodeHtml = decodeURIComponent(this.props.initialContentHTML);
    // } catch (e) {
    //   decodeHtml = this.props.initialContentHTML;
    // }
    this.setContentHTML(this.props.initialContentHTML);

    this.props.hiddenTitle && this.hideTitle();
    this.props.enableOnChange && this.enableOnChange();

    this.props.editorInitializedCallback && this.props.editorInitializedCallback();
  }

  linkTouched = message => {
    this.prepareInsert();
    const { title, url } = message.data;
    this.showLinkDialog(title, url);
  }

  contentFocused = message => {
    if (!PlatformIOS) {
      this.setEditorAvailableHeightBasedOnKeyboardHeight(this.state.keyboardHeight);
    }
    this.contentFocusHandler && this.contentFocusHandler();
  }

  selectionChange = message => {
    const items = message.data.items;
    this.state.selectionChangeListeners.map((listener) => {
      listener(items);
    });
  }

  contentChange = message => {
    // console.warn('CONTENT', JSON.stringify(message.data));
    const content = message.data.content;
    this.state.onChange.map((listener) => listener(content));
  }

  selectedTextChange = message => {
    const selectedText = message.data;
    this._selectedTextChangeListeners.forEach((listener) => {
      listener(selectedText);
    });
  };

  isSelectedNode = message => {
    const selectedText = message.data;
    if (selectedText.content) {
      this.props.isSelectionChange(true);
    } else {
      this.props.isSelectionChange(false);
    }
  }

  onBridgeMessage = (str) => {
    try {
      const message = JSON.parse(str);
      switch (message.type) {
        case messages.LOG: { this.logs(message); break; }
        case messages.FORMULA_TOUCHED: { this.formulaTouched(message); break; }
        case messages.TITLE_HTML_RESPONSE: { this.titleHtmlResponse(message); break; }
        case messages.TITLE_TEXT_RESPONSE: { this.titleTextResponse(message); break; }
        case messages.TITLE_TEXT_RESPONSE: { this.titleTextResponse(message); break; }
        case messages.CONTENT_HTML_RESPONSE: { this.contentHtmlResponse(message); break; }
        case messages.SELECTED_TEXT_RESPONSE: { this.selectedTextResponse(message); break; }
        case messages.ZSS_INITIALIZED: { this.zssInitialized(message); break; }
        case messages.LINK_TOUCHED: { this.linkTouched(message); break; }
        case messages.SCROLL: { this.webviewBridge.setNativeProps({ contentOffset: { y: message.data } }); break; }
        case messages.TITLE_FOCUSED: { this.titleFocusHandler && this.titleFocusHandler(); break; }
        case messages.CONTENT_FOCUSED: { this.contentFocused(message); break; }
        case messages.SELECTION_CHANGE: { this.selectionChange(message); break; }
        case messages.CONTENT_CHANGE: { this.contentChange(message); break; }
        case messages.SELECTED_TEXT_CHANGED: { this.selectedTextChange(message); break; }
        case messages.IS_SELECTED_NODE: { this.isSelectedNode(message); break; }
        default:
          break;
      }
    } catch (e) {
      console.log('onBridgeMessage(Error): ' + e);
    }
  }


  // _renderFormulaModal() {
  //   return (
  //     <Modal
  //       animationType={"fade"}
  //       transparent
  //       visible={this.state.showFormulaDialog}
  //       onRequestClose={() => this.setState({ showFormulaDialog: false })}
  //     >
  //       <View style={styles.modal}>
  //         <View style={[styles.innerModal, {marginBottom: PlatformIOS ? this.state.keyboardHeight : 0}]}>
  //           <Text style={styles.inputTitle}>Formula</Text>
  //           <View style={styles.inputWrapper}>
  //             <TextInput
  //               style={styles.multiInput}
  //               multiline
  //               onChangeText={(text) => this.setState({ formulaData: text })}
  //               value={this.state.formulaData}
  //             />
  //           </View>
  //           {PlatformIOS && <View style={styles.lineSeparator}/>}
  //           {this._renderFormulaButtons()}
  //         </View>
  //       </View>
  //     </Modal>
  //   );
  // }

  _renderLinkModal() {
    return (
      <Modal
        animationType={"fade"}
        transparent
        visible={this.state.showLinkDialog}
        onRequestClose={() => this.setState({ showLinkDialog: false })}
      >
        <View style={styles.modal}>
          <View style={[styles.innerModal, { marginBottom: PlatformIOS ? this.state.keyboardHeight : 0 }]}>
            <Text style={styles.inputTitle}>Title</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                onChangeText={(text) => this.setState({ linkTitle: text })}
                value={this.state.linkTitle}
              />
            </View>
            <Text style={[styles.inputTitle, { marginTop: 10 }]}>URL</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                onChangeText={(text) => this.setState({ linkUrl: text })}
                value={this.state.linkUrl}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {PlatformIOS && <View style={styles.lineSeparator} />}
            {this._renderModalButtons()}
          </View>
        </View>
      </Modal>
    );
  }

  _hideModal() {
    this.setState({
      showLinkDialog: false,
      showFormulaDialog: false,
      linkInitialUrl: '',
      linkTitle: '',
      linkUrl: '',
      formulaData: '',
    })
  }

  _renderFormulaButtons() {
    const containerPlatformStyle = PlatformIOS ? { justifyContent: 'space-between' } : { paddingTop: 15 };
    const buttonPlatformStyle = PlatformIOS ? { flex: 1, height: 45, justifyContent: 'center' } : {};
    return (
      <View style={[{ alignSelf: 'stretch', flexDirection: 'row' }, containerPlatformStyle]}>
        {!PlatformIOS && <View style={{ flex: 1 }} />}
        <TouchableOpacity
          onPress={() => this._hideModal()}
          style={buttonPlatformStyle}
        >
          <Text style={[styles.button, { paddingRight: 10 }]}>
            {this._upperCaseButtonTextIfNeeded('Cancel')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => { }}
          disabled={this.state.formulaData === ''}
          style={buttonPlatformStyle}
        >
          <Text style={[styles.button, { opacity: this.state.formulaData === '' ? 0.5 : 1 }]}>
            Update
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  _renderModalButtons() {
    const insertUpdateDisabled = this.state.linkTitle.trim().length <= 0 || this.state.linkUrl.trim().length <= 0;
    const containerPlatformStyle = PlatformIOS ? { justifyContent: 'space-between' } : { paddingTop: 15 };
    const buttonPlatformStyle = PlatformIOS ? { flex: 1, height: 45, justifyContent: 'center' } : {};
    return (
      <View style={[{ alignSelf: 'stretch', flexDirection: 'row' }, containerPlatformStyle]}>
        {!PlatformIOS && <View style={{ flex: 1 }} />}
        <TouchableOpacity
          onPress={() => this._hideModal()}
          style={buttonPlatformStyle}
        >
          <Text style={[styles.button, { paddingRight: 10 }]}>
            {this._upperCaseButtonTextIfNeeded('Cancel')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (this._linkIsNew()) {
              this.insertLink(this.state.linkUrl, this.state.linkTitle);
            } else {
              this.updateLink(this.state.linkUrl, this.state.linkTitle);
            }
            this._hideModal();
          }}
          disabled={insertUpdateDisabled}
          style={buttonPlatformStyle}
        >
          <Text style={[styles.button, { opacity: insertUpdateDisabled ? 0.5 : 1 }]}>
            {this._upperCaseButtonTextIfNeeded(this._linkIsNew() ? 'Insert' : 'Update')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderRows = (rowData, rowID, ) => {
    return (
      <View style={styles.dropDownCell}>
        <Text>{rowData}</Text>
      </View>
    );
  }

  selectHeading = (idx, value, type) => {
    if (type === 'rows') {
      this.setState({ countRows: Number(value) });
    } else {
      this.setState({ countColumn: Number(value) });
    }
  }

  _linkIsNew() {
    return !this.state.linkInitialUrl;
  }

  _upperCaseButtonTextIfNeeded(buttonText) {
    return PlatformIOS ? buttonText : buttonText.toUpperCase();
  }

  showModalWindowForCreateTable = () => {
    this.setState({ isShowWindowForTable: true });
  }

  render() {
    const pageSource = PlatformIOS ? require('./editor.html') : { uri: 'file:///android_asset/editor.html' };
    return (
      <View style={{ flex: 1 }}>
        <WebViewBridge
          {...this.props}
          ref={(r) => { this.webviewBridge = r }}
          editable={this.props.editable}
          hideKeyboardAccessoryView
          keyboardDisplayRequiresUserAction={false}
          onBridgeMessage={message => this.onBridgeMessage(message)}
          injectedJavaScript={injectScript}
          source={pageSource}
          javaScriptEnabled
          domStorageEnabled
          onLoad={() => this.init()}
        />
        {this._renderLinkModal()}
        {/* {this._renderFormulaModal()} */}
      </View>
    );
  }

  escapeJSONString = function (string) {
    return string
      .replace(/[\\]/g, '\\\\')
      .replace(/[\"]/g, '\\\"')
      .replace(/[\']/g, '\\\'')
      .replace(/[\/]/g, '\\/')
      .replace(/[\b]/g, '\\b')
      .replace(/[\f]/g, '\\f')
      .replace(/[\n]/g, '\\n')
      .replace(/[\r]/g, '\\r')
      .replace(/[\t]/g, '\\t');
  };

  _sendAction(action, data) {
    let jsonString = JSON.stringify({ type: action, data });
    jsonString = this.escapeJSONString(jsonString);
    this.webviewBridge.sendToBridge(jsonString);
  }

  showLinkDialog(optionalTitle = '', optionalUrl = '') {
    this.setState({
      linkInitialUrl: optionalUrl,
      linkTitle: optionalTitle,
      linkUrl: optionalUrl,
      showLinkDialog: true
    });
  }

  showFormulaDialog(data = '', id) {
    this.props.showMathView(true, data, id);
  }

  focusTitle() {
    this._sendAction(actions.focusTitle);
  }

  focusContent() {
    this._sendAction(actions.focusContent);
    if (!PlatformIOS) {
      this.webviewBridge.focusWebView();
    }
  }

  registerToolbar(listener) {
    this.setState({
      selectionChangeListeners: [...this.state.selectionChangeListeners, listener]
    });
  }

  enableOnChange() {
    this._sendAction(actions.enableOnChange);
  }

  registerContentChangeListener(listener) {
    this.setState({
      onChange: [...this.state.onChange, listener]
    });
  }

  setTitleHTML(html) {
    this._sendAction(actions.setTitleHtml, html);
  }
  hideTitle() {
    this._sendAction(actions.hideTitle);
  }
  showTitle() {
    this._sendAction(actions.showTitle);
  }
  toggleTitle() {
    this._sendAction(actions.toggleTitle);
  }
  setContentHTML(html) {
    if (!this.props.isSelectionActive && !PlatformIOS) {
      this._sendAction(actions.focusEditor, 'zss_editor_content');
    }
    this._sendAction(actions.setContentHtml, html);
    if (!this.props.isSelectionActive) {
      this._sendAction(actions.focusEditor, 'zss_editor_content');
    } else {
      this._sendAction(actions.restoreSelection);
    }
  }

  blurTitleEditor() {
    this._sendAction(actions.blurTitleEditor);
  }

  blurContentEditor() {
    this._sendAction(actions.blurContentEditor);
    if (!PlatformIOS) {
      this.webviewBridge.blurWebView();
    }
  }

  setBold() {
    this._sendAction(actions.setBold);
  }

  setItalic() {
    this._sendAction(actions.setItalic);
  }

  setUnderline() {
    this._sendAction(actions.setUnderline);
  }

  heading1() {
    this._sendAction(actions.heading1);
  }

  heading2() {
    this._sendAction(actions.heading2);
  }

  heading3() {
    this._sendAction(actions.heading3);
  }

  heading4() {
    this._sendAction(actions.heading4);
  }

  heading5() {
    this._sendAction(actions.heading5);
  }

  heading6() {
    this._sendAction(actions.heading6);
  }

  setParagraph() {
    this._sendAction(actions.setParagraph);
  }

  removeFormat() {
    this._sendAction(actions.removeFormat);
  }

  alignLeft() {
    this._sendAction(actions.alignLeft);
  }

  alignCenter() {
    this._sendAction(actions.alignCenter);
  }

  alignRight() {
    this._sendAction(actions.alignRight);
  }

  alignFull() {
    this._sendAction(actions.alignFull);
  }

  insertBulletsList() {
    this._sendAction(actions.insertBulletsList);
  }

  insertOrderedList() {
    this._sendAction(actions.insertOrderedList);
  }

  insertLink(url, title) {
    this._sendAction(actions.insertLink, { url, title });
  }

  updateLink(url, title) {
    this._sendAction(actions.updateLink, { url, title });
  }

  insertImage(attributes) {
    this._sendAction(actions.insertImage, attributes);
    this.prepareInsert();
  }

  updateFormula(text, id) {
    this._sendAction(actions.updateFormula, { text, id });
  }

  setFontFamily(font) {
    this._sendAction(actions.setFontFamily, font);
  }

  setSubscript() {
    this._sendAction(actions.setSubscript);
  }

  setSuperscript() {
    this._sendAction(actions.setSuperscript);
  }

  setStrikethrough() {
    this._sendAction(actions.setStrikethrough);
  }

  setHR() {
    this._sendAction(actions.setHR);
  }

  setIndent() {
    this._sendAction(actions.setIndent);
  }

  setOutdent() {
    this._sendAction(actions.setOutdent);
  }

  setBackgroundColor(color) {
    this._sendAction(actions.setBackgroundColor, color);
  }

  setTextColor(color) {
    this._sendAction(actions.setTextColor, color);
  }

  setTitlePlaceholder(placeholder) {
    this._sendAction(actions.setTitlePlaceholder, placeholder);
  }

  setContentPlaceholder(placeholder) {
    this._sendAction(actions.setContentPlaceholder, placeholder);
  }

  setCustomCSS(css) {
    this._sendAction(actions.setCustomCSS, css);
  }

  prepareInsert() {
    this._sendAction(actions.prepareInsert);
  }

  restoreSelection() {
    this._sendAction(actions.restoreSelection);
  }

  init() {
    if (!this.isInited) {
      this._sendAction(actions.init);
      this.setPlatform();
      if (this.props.footerHeight) {
        this.setFooterHeight();
      }
      this.isInited = true;
    }
  }

  setEditorHeight(height) {
    this._sendAction(actions.setEditorHeight, height);
  }

  setFooterHeight() {
    this._sendAction(actions.setFooterHeight, this.props.footerHeight);
  }

  setPlatform() {
    this._sendAction(actions.setPlatform, Platform.OS);
  }

  async getTitleHtml() {
    return new Promise((resolve, reject) => {
      this.titleResolve = resolve;
      this.titleReject = reject;
      this._sendAction(actions.getTitleHtml);

      this.pendingTitleHtml = setTimeout(() => {
        if (this.titleReject) {
          this.titleReject('timeout');
        }
      }, 5000);
    });
  }

  async getTitleText() {
    return new Promise((resolve, reject) => {
      this.titleTextResolve = resolve;
      this.titleTextReject = reject;
      this._sendAction(actions.getTitleText);

      this.pendingTitleText = setTimeout(() => {
        if (this.titleTextReject) {
          this.titleTextReject('timeout');
        }
      }, 5000);
    });
  }

  async getContentHtml() {
    return new Promise((resolve, reject) => {
      this.contentResolve = resolve;
      this.contentReject = reject;
      this._sendAction(actions.getContentHtml);
      // console.warn('_sendAction')
      this.pendingContentHtml = setTimeout(() => {
        if (this.contentReject) {
          this.contentReject('timeout');
        }
      }, 5000);
    });
  }
  // getContentHtml = () => {
  //   this._sendAction(actions.getContentHtml);
  // }

  async getSelectedText() {
    return new Promise((resolve, reject) => {
      this.selectedTextResolve = resolve;
      this.selectedTextReject = reject;
      this._sendAction(actions.getSelectedText);

      this.pendingSelectedText = setTimeout(() => {
        if (this.selectedTextReject) {
          this.selectedTextReject('timeout');
        }
      }, 5000);
    });
  }

  setTitleFocusHandler(callbackHandler) {
    this.titleFocusHandler = callbackHandler;
    this._sendAction(actions.setTitleFocusHandler);
  }

  setContentFocusHandler(callbackHandler) {
    this.contentFocusHandler = callbackHandler;
    this._sendAction(actions.setContentFocusHandler);
  }

  addSelectedTextChangeListener(listener) {
    this._selectedTextChangeListeners.push(listener);
  }
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  innerModal: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingTop: 20,
    paddingBottom: PlatformIOS ? 0 : 20,
    paddingLeft: 20,
    paddingRight: 20,
    alignSelf: 'stretch',
    margin: 40,
    borderRadius: PlatformIOS ? 8 : 2
  },
  button: {
    fontSize: 16,
    color: '#4a4a4a',
    textAlign: 'center'
  },
  inputWrapper: {
    marginTop: 5,
    marginBottom: 10,
    borderBottomColor: '#4a4a4a',
    borderBottomWidth: PlatformIOS ? 1 / PixelRatio.get() : 0
  },
  inputTitle: {
    color: '#4a4a4a'
  },
  input: {
    height: PlatformIOS ? 20 : 40,
    paddingTop: 0
  },
  multiInput: {
    height: 200,
  },
  lineSeparator: {
    height: 1 / PixelRatio.get(),
    backgroundColor: '#d5d5d5',
    marginLeft: -20,
    marginRight: -20,
    marginTop: 20
  },
  dropDownBody: {
    width: (displayWidth / 2) + 7,
    height: 95,
    marginTop: (Platform.OS === 'ios') ? 0 : -30,
  },
  dropDownCell: {
    width: (displayWidth / 2) - 15,
    height: 30,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 15
  },
  dropDownContainer: {
    width: displayWidth / 2,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  downArrow: {
    width: 30,
    height: 15,
    marginRight: 10,
  },
  modalTableButton: {
    flex: 1,
    height: 50,
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  modalTableWindow: {
    width: displayWidth - 100,
    height: 300,
    backgroundColor: 'white',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tableButtonsContainer: {
    width: displayWidth - 100,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
});