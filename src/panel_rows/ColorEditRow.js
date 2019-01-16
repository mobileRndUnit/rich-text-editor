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
  Text
} from 'react-native';
import { actions } from '../const';
const displayWidth = Dimensions.get('window').width;
const PlatformIOS = Platform.OS === 'ios';
const downArrow = require('../../img/icon_down_arrow.png');

const listActions = [
  actions.setTextColor,
  actions.setBackgroundColor,
]
const listTextColors = [
  'rgb(0,0,0)',
  'rgb(132,132,132)',
  'rgb(0,16,255)',
  'rgb(255,0,0)',
  'rgb(157,0,255)',
  'rgb(87,163,0)',
  'rgb(253,115,0)',
]
const listHighlightColors = [
  'rgb(255,255,255)',
  'rgb(248,231,28)',
  'rgb(184,233,134)',
  'rgb(74,144,226)',
  'rgb(80,227,194)',
  'rgb(245,166,35)',
  'rgb(241,174,255)',
  'rgb(226,226,226)',
]
export default class ColorEditRow extends Component {
  render() {
    return (
      <View style={styles.mainRows}>
        <Text style={styles.titleRow}>{this.props.title}</Text>
        <View style={{ width: displayWidth * 0.6, }}>
          {
            (this.props.text) ?
              <View style={styles.colorsContainer}>
                {
                  listTextColors.map((color, index) => {
                    return (
                      <TouchableOpacity
                        key={color}
                        style={styles.colorContainer}
                        onPress={() => this.props.onPress(listActions[0], color)}
                      >
                        <View style={[styles.color, { backgroundColor: color }]} />
                      </TouchableOpacity>
                    );
                  })
                }
              </View>
              :
              <View style={styles.colorsContainer}>
                {
                  listHighlightColors.map((color, index) => {
                    return (
                      <TouchableOpacity
                        key={color}
                        style={styles.colorContainer}
                        onPress={() => this.props.onPress(listActions[1], color)}
                      >
                        <View style={[styles.color, { backgroundColor: color }]} />
                      </TouchableOpacity>
                    );
                  })
                }
              </View>
          }
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  dropDownContainer: {
    flex: 1,
    height: 49,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 15,
    backgroundColor: 'white',
  },
  downArrow: {
    width: 30,
    height: 15,
    marginRight: 10,
  },
  mainRows: {
    width: displayWidth,
    height: 49,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
  },
  verticalSeparator: {
    width: 1,
    height: 40,
    backgroundColor: 'rgb(122, 57, 150)',
  },
  colorContainer: {
    flex: 1,
    height: 49,
    alignItems: 'center',
    justifyContent: 'center',
  },
  color: {
    width: 20,
    height: 20,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgb(172,172,172)',
  },
  colorsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'white',
  },
  titleRow: {
    fontSize: 16,
    paddingLeft: 15,
  }
});