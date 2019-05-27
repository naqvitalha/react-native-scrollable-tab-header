import React from 'react';
import {
    View,
    StyleSheet,
    Text,
    TouchableWithoutFeedback
} from 'react-native';

export default class Tabs extends React.Component {

    shouldComponentUpdate(newProps) {
        return newProps.isTabActive !== this.props.isTabActive
    }

    render() {
        const {activeTextColor, inactiveTextColor, textStyle,} = this.props;
        const textColor = this.props.isTabActive ? activeTextColor : inactiveTextColor;
        const fontWeight = this.props.isTabActive ? 'bold' : 'normal';

        return <TouchableWithoutFeedback
            key={`${name}_${this.props.page}`}
            accessible={true}
            accessibilityLabel={this.props.name}
            accessibilityTraits='button'
            onPress={() => this.props.onPressHandler(this.props.page)}
            onLayout={this.props.onLayoutHandler}
        >
            <View style={[styles.tab, this.props.tabStyle,]}>
                <Text style={[{color: textColor, fontWeight,}, textStyle,]}>
                    {this.props.name}
                </Text>
            </View>
        </TouchableWithoutFeedback>;
    }
}

const styles = StyleSheet.create({
    tab: {
        height: 49,
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 20,
        paddingRight: 20,
    },
    container: {
        height: 50,
        borderWidth: 1,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderColor: '#ccc',
    },
    tabs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});