import React, {Component, PropTypes} from 'react';
import {
  ListView, 
  View, 
  TouchableOpacity, 
  Image, 
  StyleSheet,
  Dimensions,
  Keyboard,
  Platform,
  Text
} from 'react-native';
import { actions } from '../const';
import Icon from 'react-native-vector-icons/FontAwesome';
const displayWidth = Dimensions.get('window').width;
const PlatformIOS = Platform.OS === 'ios';

const defaultActions = [
  actions.setBold,
  actions.setItalic,
  actions.setUnderline,
  actions.setStrikethrough,
  actions.setSubscript,
  actions.setSuperscript,
];

function getDefaultIcon() {
  const texts = {};
  texts[actions.setBold] = 'bold';
  texts[actions.setItalic] = 'italic';  
  texts[actions.setUnderline] = 'underline';
  texts[actions.setStrikethrough] = 'strikethrough';  
  texts[actions.setSubscript] = 'subscript';
  texts[actions.setSuperscript] = 'superscript';
  return texts;
}

export default class TextEditRow extends Component {
  render() {
    return (
      <View style={styles.mainRows}>
      {
        defaultActions.map((action, index) => {
          const icon = (getDefaultIcon()[action]);
          return (
            <TouchableOpacity
              key={action}
              style={styles.button}
              onPress={() => this.props.onPress(action)}
            >
              <Icon
                name={icon} 
                size={15} 
                color='rgb(122, 57, 150)'
              />
            </TouchableOpacity>
          );
        })
      }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainRows: {
    width: displayWidth,
    height: 49,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'white',
  },
  button: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  icon: {
    width: 40, 
    height: 40,
  }
});