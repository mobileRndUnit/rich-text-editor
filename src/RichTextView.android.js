import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
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
          this.richtext.focusContent();
        } else {
          this.richtext._sendAction(actions.notEditable);
          this.richtext.blurContentEditor();
        }
      }
    }
  }

  showTextPanel = () => {
    this.richtext.blurContentEditor();
    setTimeout(() => {
      this.setState({ isShowToolbar: true });
    }, 0);
  }

  hideTextPanel = () => {
    this.setState({ isShowToolbar: false });
    setTimeout(() => {
      this.richtext.focusContent();
    }, 0);
  }

  showTableModal = () => {
    this.richtext.blurContentEditor();
    setTimeout(() => {
      this.setState({ isShowModalForTeable: true });
    }, 0);
  }

  hideTableModal = (data = '') => {
    if (!data) {
      this.setState({ isShowModalForTeable: false });
    } else {
      this.setState({ isShowModalForTeable: false });

      setTimeout(() => {
        this.richtext.focusContent();
        this.richtext._sendAction(actions.insertTableIOS, data);
      }, 0);
    }
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

  // MATHVIEW ACTIONS

  showMathView = (isNew, data = '', id = '') => {
    if (!isNew) {
      this.richtext.blurContentEditor();
      setTimeout(() => {
        this.setState({
          isShowMathView: true,
          isNewFormula: false,
        });
      }, 0);
    } else {

      if (data !== '' && id !== '') {
        this.richtext.blurContentEditor();

        setTimeout(() => {
          this.setState({
            isShowMathView: true,
            formulaData: data,
            formulaId: id,
            isNewFormula: true,
          });
        }, 0);
      }
    }
  }

  hideMathView = () => {
    this.setState({
      isShowMathView: false,
      formulaData: '',
      formulaId: null
    });

    setTimeout(() => {
      this.richtext.focusContent();
    }, 0);
  }

  insertMath = (mathEquation) => {
    const { formulaId: id } = this.state;

    this.setState({ isShowMathView: false });

    setTimeout(() => {
      this.richtext.focusContent();
      this.richtext._sendAction(actions.insertData, `<span class="math-tex">\\(${mathEquation}\\)</span>`);
      this.setState({
        formulaData: '',
        formulaId: null
      });
    }, 0);
  }

  updateMath = (text) => {
    const { formulaId: id } = this.state;

    this.setState({ isShowMathView: false });

    setTimeout(() => {
      this.richtext.focusContent();
      this.richtext._sendAction(actions.updateFormula, { text, id });
      this.setState({
        formulaData: '',
        formulaId: null
      });
    }, 0);
  }

  mathViewOnPress = (value) => {
    if (this.state.isNewFormula) {
      this.updateMath(value);
    } else {
      this.insertMath(value);
    }
  }

  mathViewOnRemovePress = () => {
    const { formulaId: id } = this.state;

    this.setState({ isShowMathView: false });

    setTimeout(() => {
      this.richtext.focusContent();
      this.richtext._sendAction(actions.removeFormula, { id });
      this.setState({
        formulaData: '',
        formulaId: null
      });
    }, 0);
  }


  render() {
    // console.warn('initial', JSON.stringify(this.props.content, null, 2))
    let editorView = (
      <RichTextEditor
        ref={(r) => this.richtext = r}
        style={this.props.styles}
        editable={this.state.isEditable}
        //enableOnChange
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
            changeColor={() => {
              this.setDirectTextColor('#309980');
            }}
            hideMathView={this.hideMathView}
            showMathView={this.showMathView}
            isSelectionActive={this.state.isSelectionActive}
            hideTableModal={this.hideTableModal}
            showTableModal={this.showTableModal}
            // panel
            showTextPanel={this.showTextPanel}
            hideTextPanel={this.hideTextPanel}
          />
        }
        <Modal
          visible={this.state.isShowToolbar}
          supportedOrientations={['portrait', 'landscape']}
          animationType={'slide'}
          transparent
          onRequestClose={() => this.hideTextPanel()}
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
            isNewFormula={this.state.isNewFormula}
            value={this.state.formulaData}
            onPress={this.mathViewOnPress}
            onClosePress={this.hideMathView}
            onRemovePress={this.mathViewOnRemovePress}
          />
        </Modal>
        <Modal
          visible={this.state.isShowModalForTeable}
          supportedOrientations={['portrait', 'landscape']}
          animationType={'slide'}
          transparent
          onShow={() => this.refs.table.focusRows()}
          onRequestClose={() => this.hideTableModal()}
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
