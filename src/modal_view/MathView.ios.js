import React, { Component, PropTypes } from 'react';
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
} from 'react-native';
import { actions } from '../const';

const displayWidth = Dimensions.get('window').width;
const displayHeight = Dimensions.get('window').height;
const PlatformIOS = Platform.OS === 'ios';

const listActions = [
  actions.insertData,
]

export default class MathView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editor: undefined,
      mathEquation: props.value || 'x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}',
      id: props.id || null,
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

  insertMath = () => {
    this.props.hideMathView();

    if (!this.props.isSelectionActive && !PlatformIOS) {
      this.state.editor._sendAction(actions.focusEditor, 'zss_editor_content');
    }
    this.state.editor._sendAction(listActions[0], `<span class="math-tex">\\(${this.state.mathEquation}\\)</span>`);
    if (!this.props.isSelectionActive) {
      this.state.editor._sendAction(actions.focusEditor, 'zss_editor_content');
    } else {
      this.state.editor._sendAction(actions.restoreSelection);
    }
  }

  updateMath = () => {
    const { mathEquation: text, id } = this.state;
    this.props.hideMathView();
    console.warn('updateMath' + text + ' :|||: ' + id);
    this.state.editor._sendAction(actions.updateFormula, { text, id });
  }

  _onPress = () => {
    if (!this.props.isNewFormula) {
      this.insertMath();
    } else {
      this.updateMath();
    }
  }

  _onRemovePress = () => {
    const { id } = this.props;

    this.props.hideMathView();
    this.state.editor._sendAction(actions.removeFormula, { id });
    this.props.focus();
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={styles.container}>
          <TextInput
            value={this.state.mathEquation}
            style={styles.input}
            onChangeText={(text) => this.setState({ mathEquation: text })}
            underlineColorAndroid={'transparent'}
          />
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => this.props.hideMathView()}
            >
              <Text>Cancel</Text>
            </TouchableOpacity>
            {
              this.props.isNewFormula &&
              <TouchableOpacity
                style={styles.button}
                onPress={this._onRemovePress}
              >
                <Text style={{ color: '#ff2030' }}>Remove</Text>
              </TouchableOpacity>
            }
            <TouchableOpacity
              style={styles.button}
              onPress={this._onPress}
            >
              <Text>Ok</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderWidth: 1,
    width: displayWidth - 50,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonsContainer: {
    width: displayWidth - 50,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  button: {
    flex: 1,
    height: 50,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  input: {
    width: displayWidth - 90,
    height: 50,
    marginLeft: 20,
    borderWidth: 1,
    paddingLeft: 15,
    fontSize: 14,
  },
});
