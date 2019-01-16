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
import Icon from 'react-native-vector-icons/FontAwesome';
import ModalDropdown from '../dropdown';
import {actions} from '../const';

const displayWidth = Dimensions.get('window').width;
const PlatformIOS = Platform.OS === 'ios';
const downArrow = require('../../img/icon_down_arrow.png');
const listHeadingActions = [
  actions.heading1,
  actions.heading2,
  actions.heading3,
  actions.heading4,
  actions.heading5,
  actions.heading6,
];
const listActions = [
  actions.insertBulletsList,
  actions.insertOrderedList,
];
const indentActions = [
  actions.setIndent,
  actions.setOutdent,
];
function getDefaultListsIcon() {
  const texts = {};
  texts[actions.insertBulletsList] = 'list';
  texts[actions.insertOrderedList] = 'list-ol';
  return texts;
}

function getDefaultIndentsIcon() {
  const texts = {};
  texts[actions.setIndent] = 'indent';
  texts[actions.setOutdent] = 'outdent';
  return texts;
}

export default class HeadingEditRow extends Component {
  constructor() {
    super();
    this.state = {
      selectedHeading: 'Heading 1',
    };
  }

  renderRows = (rowData, rowID,) => {
    return (
      <View style={styles.dropDownCell}>
        <Text>{rowData}</Text>
      </View>
    );
  }

  selectHeading = (idx, value) => {
    this.setState({ selectedHeading: value }, () => {
      this.props.onPress(listHeadingActions[idx]);
    });
  }

  render() {  
    return (
      <View style={styles.mainRows}>
        <View style={styles.dropDownContainer}>
          <ModalDropdown
            dropdownStyle={styles.dropDownBody}
            style={{ flex: 1, }}
            options={['Heading 1', 'Heading 2', 'Heading 3','Heading 4', 'Heading 5', 'Heading 6']}
            renderRow={this.renderRows}
            onSelect={(idx, value) => {
              console.warn(idx, value);
              this.selectHeading(idx, value);
            }}
          >
          <View style={styles.headingContainer}>
            <Text style={{ marginLeft: 15 }}>{this.state.selectedHeading}</Text>
              <Image 
                source={downArrow}
                style={styles.downArrow}
                resizeMode={'contain'}
              />
            </View>
          </ModalDropdown>
        </View> 
        <View style={styles.rightContainer}>
        {
          listActions.map((action, index) => {
            const icon = (getDefaultListsIcon()[action]);
            return (
              <TouchableOpacity
                key={action}
                style={styles.button}
                onPress={() => this.props.onPress(action)}
              >     
                <Icon
                  name={icon} 
                  size={20} 
                  color='rgb(122, 57, 150)'
                />     
              </TouchableOpacity>
            );   
          })
        }
        {
          indentActions.map((action, index) => {
            const icon = (getDefaultIndentsIcon()[action]);
            return (
              <TouchableOpacity
                key={action}
                style={styles.button}
                onPress={() => this.props.onPress(action)}
              >     
                <Icon
                  name={icon} 
                  size={20} 
                  color='rgb(122, 57, 150)'
                />   
              </TouchableOpacity>
            );   
          })
        }
        </View>          
      </View>
    );
  }
}

const styles = StyleSheet.create({
  dropDownContainer: { 
    width: displayWidth / 2 + 7,
    height: 49, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
  },
  headingContainer: { 
    width: displayWidth / 2, 
    height: 50, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
  },
  rightContainer: { 
    flex: 1, 
    height: 49, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderLeftWidth: 1 
  },
  downArrow: {
    width: 30,
    height: 15,
    marginRight: 10,
  },
  dropDownCell: { 
    width: (displayWidth / 2) - 15, 
    height: 30, 
    alignItems: 'flex-start', 
    justifyContent: 'center', 
    paddingLeft: 15 
  },
  dropDownBody: {
    width: displayWidth / 2 + 7,
    height: 145,
    marginTop: (Platform.OS === 'ios') ? 0 : - 30,
  },
  mainRows: {
    width: displayWidth,
    height: 49,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  verticalSeparator: { 
    width: 1, 
    height: 40, 
    backgroundColor: 'rgb(122, 57, 150)' 
  },
  button: { 
    height: 50 , 
    width: displayWidth / 9, 
    justifyContent: 'center', 
    flexDirection: 'row', 
    alignItems: 'center', 
  },
});