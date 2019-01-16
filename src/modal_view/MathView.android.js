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

const displayWidth = Dimensions.get('window').width;
const displayHeight = Dimensions.get('window').height;

export default class MathView extends Component {
    state = {
        mathEquation: this.props.value || 'x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}',
    };

    render() {
        const {
            onClosePress,
            onPress,
            onRemovePress,
            isNewFormula
        } = this.props;
        const { mathEquation } = this.state;

        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <View style={styles.container}>
                    <TextInput
                        value={mathEquation}
                        style={styles.input}
                        onChangeText={(text) => this.setState({ mathEquation: text })}
                        underlineColorAndroid="transparent"
                    />
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={onClosePress}
                        >
                            <Text>Cancel</Text>
                        </TouchableOpacity>
                        {
                            isNewFormula &&
                            <TouchableOpacity
                                style={styles.button}
                                onPress={onRemovePress}
                            >
                                <Text style={{ color: '#ff2030' }}>Remove</Text>
                            </TouchableOpacity>
                        }
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => onPress(mathEquation)}
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
