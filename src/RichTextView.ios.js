import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  // Platform,
  TouchableOpacity,
  InteractionManager,
  Modal,
  Dimensions,
} from 'react-native';
import RichTextEditor from './RichTextEditor';
import RichTextToolbar from './RichTextToolbar';
import RichTextPanel from './RichTextPanel';

import MathView from './modal_view/MathView';
import TableView from './modal_view/TableView';
import KeyboardSpacer from './keyboardSpacer';
import { actions } from './const';

// const isIOS = Platform.OS === 'ios';
const displayWidth = Dimensions.get('window').width;
const displayHeight = Dimensions.get('window').height;

export default class RichTextView extends Component {

  constructor(props) {
    super(props);
    this.getHTML = this.getHTML.bind(this);
    this.setFocusHandlers = this.setFocusHandlers.bind(this);
    this.state = {
      isShowToolbar: false,
      isShowMathView: false,
      isSelectionActive: false,
      isShowModalForTeable: false,
      formulaData: '',
      formulaId: null,
      isNewFormula: false,
      isEditable: false,
      content: '',
      initialContent: props.content,
    };
  }

  componentDidMount() {
    this.setState({
      content: this.props.content,
      isEditable: this.props.editable,
    });

    if (this.props.editable) {
      this.richtext._sendAction(actions.setEditable);
    }
  }

  reset = (v) => {
    // try {
    //   const decodeHtml = decodeURIComponent(v);

    //   this.richtext._sendAction(actions.setContentHtml, decodeHtml);
    // } catch (e) {
    //   this.richtext._sendAction(actions.setContentHtml, v);
    // }
    this.richtext._sendAction(actions.setContentHtml, v);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.preview) {
      if (nextProps.content !== this.props.content) {
        // try {
        //   const decodeHtml = decodeURIComponent(nextProps.content);

        //   this.richtext._sendAction(actions.setContentHtml, decodeHtml);
        // } catch (e) {
        //   this.richtext._sendAction(actions.setContentHtml, nextProps.content);
        // }
        this.richtext._sendAction(actions.setContentHtml, nextProps.content);
      }
    }

    if (!this.props.preview) {
      if (nextProps.editable !== this.state.isEditable) {
        this.setState({ isEditable: nextProps.isEnableEditable });
        if (nextProps.editable) {
          this.richtext._sendAction(actions.setEditable);
        } else {
          this.richtext._sendAction(actions.notEditable);
          this.richtext.blurContentEditor();
        }
      }
    }
  }

  hideTextPanel = () => {
    this.setState({ isShowToolbar: false });

    this.richtext._sendAction(actions.restoreSelection);
  }

  showTextPanel = () => {
    this.prepareEditorForInsertData();
    this.setState({ isShowToolbar: true });
  }

  showTableModal = () => {
    this.prepareEditorForInsertData();

    this.setState({ isShowModalForTeable: true });
  }

  hideTableModal = (data = '') => {
    this.setState({ isShowModalForTeable: false });

    this.richtext._sendAction(actions.restoreSelection);
    setTimeout(() => {
      if (data) {
        this.richtext._sendAction(actions.insertTableIOS, data);
      }
    }, 1000);
  }

  showMathView = (isNew, data = '', id) => {
    this.prepareEditorForInsertData();
    if (!isNew) {
      this.setState({
        isShowMathView: true,
        isNewFormula: false,
      });
    } else {
      if (data !== '' && id !== "undefined") {
        this.setState({
          isShowMathView: true,
          formulaData: data,
          formulaId: id,
          isNewFormula: true,
        });
      }
    }
  }

  hideMathView = () => {
    this.setState({ isShowMathView: false });

    this.richtext._sendAction(actions.restoreSelection);
  }

  isSelectionChange = (flag) => {
    this.setState({ isSelectionActive: flag });
  }

  setEditable = () => {
    this.richtext._sendAction(actions.setEditable);
  }

  setTextColor = (color) => {
    this.richtext._sendAction(actions.setTextColor, color);
  }

  setDirectTextColor = (color) => {
    this.richtext.setTextColor(color);
  }


  render() {
    // console.warn('initial', JSON.stringify(this.props.content, null, 2))
    let editorView = (
      <RichTextEditor
        ref={(r) => this.richtext = r}
        style={this.props.styles}
        editable={this.state.isEditable}
        // enableOnChange
        headerHeight={this.props.headerHeight}
        initialContentHTML={this.props.content}
        editorInitializedCallback={() => this.onEditorInitialized()}
        isSelectionChange={this.isSelectionChange}
        isShowModalForTeable={this.state.isShowModalForTeable}
        hideTableModal={this.hideTableModal}
        showMathView={this.showMathView}
        isSelectionActive={this.state.isSelectionActive}
        auth={this.props.auth}
      />
    );

    if (this.props.preview) {
      return (
        <View
          style={{
            width: displayWidth - 26 - 54,
            height: 200,
            marginLeft: 26,
            marginRight: 54,
            marginBottom: 10
          }}
        >
          {editorView}
        </View>
      );
    }

    return (
      <View style={styles.container}>
        {editorView}
        {
          (this.props.isShowToolbar) &&
          <RichTextToolbar
            getEditor={() => this.richtext}
            hideTextPanel={this.hideTextPanel}
            changeColor={() => {
              this.setDirectTextColor('#309980');
            }}
            isSelectionActive={this.state.isSelectionActive}
            // table
            hideTableModal={this.hideTableModal}
            showTableModal={this.showTableModal}
            // panel
            hideTextPanel={this.hideTextPanel}
            showTextPanel={this.showTextPanel}
            // math
            hideMathView={this.hideMathView}
            showMathView={this.showMathView}
          />
        }
        <Modal
          visible={this.state.isShowToolbar}
          supportedOrientations={['portrait', 'landscape']}
          animationType={'slide'}
          transparent
          onRequestClose={this.hideTextPanel}
        >
          <RichTextPanel
            getEditor={() => this.richtext}
            hideTextPanel={this.hideTextPanel}
            changeColor={(color) => {
              this.setDirectTextColor(color);
            }}
          />
        </Modal>
        <Modal
          visible={this.state.isShowMathView}
          animationType={'slide'}
          transparent
          onRequestClose={this.hideMathView}
        >
          <MathView
            getEditor={() => this.richtext}
            hideMathView={this.hideMathView}
            isNewFormula={this.state.isNewFormula}
            focus={() => this.richtext.focusContent()}
            value={this.state.formulaData}
            id={this.state.formulaId}
            isSelectionActive={this.state.isSelectionActive}
          />
        </Modal>
        <Modal
          visible={this.state.isShowModalForTeable}
          supportedOrientations={['portrait', 'landscape']}
          animationType={'slide'}
          transparent
          onShow={() => this.refs.table.focusRows()}
          onRequestClose={this.hideTableModal}
        >
          <TableView
            getEditor={() => this.richtext}
            ref="table"
            hideTableModal={this.hideTableModal}
            isSelectionActive={this.state.isSelectionActive}
          />
        </Modal>
        <KeyboardSpacer />
      </View>
    );
  }

  prepareEditorForInsertData = () => {
    this.richtext._sendAction(actions.prepareInsert);
    this.richtext._sendAction(actions.isSelectedNode);
  }

  onEditorInitialized() {
    // this.setFocusHandlers();
    // this.getHTML();
    if (this.props.editable) {
      this.richtext._sendAction(actions.setEditable);
      this.richtext._sendAction(actions.focusContent);
    }
  }

  async getHTML() {
    const contentHtml = await this.richtext.getContentHtml();
    this.props.getContentFromPage(contentHtml);
  }

  setFocusHandlers() {
    this.richtext.setTitleFocusHandler(() => {
    });
    this.richtext.setContentFocusHandler(() => {
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    // paddingTop: 40,
  },
  richText: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
