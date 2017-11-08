import {TouchableWithoutFeedback} from "react-native";
import PropTypes from 'prop-types';

const React = require('react');
const ReactNative = require('react-native');
const {
    View,
    Animated,
    StyleSheet,
    ScrollView,
    Text,
    Platform,
    Dimensions
} = ReactNative;

const WINDOW_WIDTH = Dimensions.get('window').width;

class ScrollableTabs extends React.Component{
    constructor(props) {
        super(props);
        this._tabsMeasurements = [];
        this.scrollValue = new Animated.Value(0);
        this.state = {
            _leftTabUnderline: new Animated.Value(0),
            _widthTabUnderline: new Animated.Value(0),
            _containerWidth: null,
            activeTab: 0
        };
        this.renderTab = this.renderTab.bind(this);
        this.onTabContainerLayout = this.onTabContainerLayout.bind(this);
        this.onContainerLayout = this.onContainerLayout.bind(this);
        this._updateView = this._updateView.bind(this);
    }

    componentDidMount() {
        this.scrollValue.addListener(this._updateView);
    }

    componentWillMount() {
        if (this.props.activeTab !== this.state.activeTab) {
            this.scrollValue.setValue(this.props.activeTab)
            this.setState({activeTab: this.props.activeTab});
        }
    }

    updateOffsetExternal(currentOffset, pageWidth) {
        this.scrollValue.setValue(currentOffset / pageWidth);
    }

    _updateView(offset) {
        const position = Math.floor(offset.value);
        const pageOffset = offset.value % 1;
        const tabCount = this.props.tabs.length;
        const lastTabPosition = tabCount - 1;

        if (tabCount === 0 || offset.value < 0 || offset.value > lastTabPosition) {
            return;
        }

        if (this.necessarilyMeasurementsCompleted(position, position === lastTabPosition)) {
            this.updateTabPanel(position, pageOffset);
            this.updateTabUnderline(position, pageOffset, tabCount);
        }

        const activePosition = Math.round(offset.value);
        if (activePosition !== this.state.activeTab) {
            this.setState({activeTab: activePosition});
        }
    }

    necessarilyMeasurementsCompleted(position, isLastTab) {
        return this._tabsMeasurements[position] &&
            (isLastTab || this._tabsMeasurements[position + 1]) &&
            this._tabContainerMeasurements &&
            this._containerMeasurements;
    }

    updateTabPanel(position, pageOffset) {
        const containerWidth = this._containerMeasurements.width;
        const tabWidth = this._tabsMeasurements[position].width;
        const nextTabMeasurements = this._tabsMeasurements[position + 1];
        const nextTabWidth = nextTabMeasurements && nextTabMeasurements.width || 0;
        const tabOffset = this._tabsMeasurements[position].left;
        const absolutePageOffset = pageOffset * tabWidth;
        let newScrollX = tabOffset + absolutePageOffset;

        // center tab and smooth tab change (for when tabWidth changes a lot between two tabs)
        newScrollX -= (containerWidth - (1 - pageOffset) * tabWidth - pageOffset * nextTabWidth) / 2;
        newScrollX = newScrollX >= 0 ? newScrollX : 0;

        if (Platform.OS === 'android') {
            this._scrollView.scrollTo({x: newScrollX, y: 0, animated: false,});
        } else {
            const rightBoundScroll = this._tabContainerMeasurements.width - (this._containerMeasurements.width);
            newScrollX = newScrollX > rightBoundScroll ? rightBoundScroll : newScrollX;
            this._scrollView.scrollTo({x: newScrollX, y: 0, animated: false,});
        }

    }

    updateTabUnderline(position, pageOffset, tabCount) {
        const lineLeft = this._tabsMeasurements[position].left;
        const lineRight = this._tabsMeasurements[position].right;

        if (position < tabCount - 1) {
            const nextTabLeft = this._tabsMeasurements[position + 1].left;
            const nextTabRight = this._tabsMeasurements[position + 1].right;

            const newLineLeft = (pageOffset * nextTabLeft + (1 - pageOffset) * lineLeft);
            const newLineRight = (pageOffset * nextTabRight + (1 - pageOffset) * lineRight);

            const newLineWidth = newLineRight - newLineLeft;

            this.state._leftTabUnderline.setValue(newLineWidth / 2 + newLineLeft);
            this.state._widthTabUnderline.setValue(newLineWidth);
        } else {
            const newLineWidth = lineRight - lineLeft;
            this.state._leftTabUnderline.setValue(newLineWidth / 2 + lineLeft);
            this.state._widthTabUnderline.setValue(newLineWidth);
        }
    }

    renderTab(name, page, isTabActive, onPressHandler, onLayoutHandler) {
        const {activeTextColor, inactiveTextColor, textStyle,} = this.props;
        const textColor = isTabActive ? activeTextColor : inactiveTextColor;
        const fontWeight = isTabActive ? 'bold' : 'normal';

        return <TouchableWithoutFeedback
        key={`${name}_${page}`}
        accessible={true}
        accessibilityLabel={name}
        accessibilityTraits='button'
        onPress={() => onPressHandler(page)}
        onLayout={onLayoutHandler}
            >
            <View style={[styles.tab, this.props.tabStyle,]}>
    <Text style={[{color: textColor, fontWeight,}, textStyle,]}>
        {name}
    </Text>
        </View>
        </TouchableWithoutFeedback>;
    }

    measureTab(page, event) {
        const {x, width, height,} = event.nativeEvent.layout;
        this._tabsMeasurements[page] = {left: x, right: x + width, width, height,};
        this._updateView({value: this.scrollValue._value,});
    }

    render() {
        const tabUnderlineStyle = {
            position: 'absolute',
            height: 4,
            backgroundColor: 'navy',
            bottom: 0,
            left: 0
        };

        const dynamicTabUnderline = {
            width: 1,
            transform: [
                {translateX: this.state._leftTabUnderline},
                {scaleX: this.state._widthTabUnderline}
            ]
        };

        return <View
        style={[styles.container, {backgroundColor: this.props.backgroundColor}, this.props.style,]}
        onLayout={this.onContainerLayout}
    >
    <ScrollView
        automaticallyAdjustContentInsets={false}
        ref={(scrollView) => {
            this._scrollView = scrollView;
        }}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        directionalLockEnabled={true}
        onScroll={this.props.onScroll}
        bounces={false}
        scrollsToTop={false}
            >
            <View
        style={[styles.tabs, {width: this.state._containerWidth,}, this.props.tabsContainerStyle,]}
        ref={'tabContainer'}
        onLayout={this.onTabContainerLayout}
    >
        {this.props.tabs.map((name, page) => {
            const isTabActive = this.state.activeTab === page;
            const renderTab = this.props.renderTab || this.renderTab;
            return renderTab(name, page, isTabActive, this.props.goToPage, this.measureTab.bind(this, page));
        })}
    <Animated.View style={[tabUnderlineStyle, dynamicTabUnderline, this.props.underlineStyle,]}/>
    </View>
        </ScrollView>
        </View>;
    }

    componentWillReceiveProps(nextProps) {
        // If the tabs change, force the width of the tabs container to be recalculated
        if (JSON.stringify(this.props.tabs) !== JSON.stringify(nextProps.tabs) && this.state._containerWidth) {
            this.setState({_containerWidth: null,});
        }
    }

    onTabContainerLayout(e) {
        this._tabContainerMeasurements = e.nativeEvent.layout;
        let width = this._tabContainerMeasurements.width;
        if (width < WINDOW_WIDTH) {
            width = WINDOW_WIDTH;
        }
        this.setState({_containerWidth: width,});
        this._updateView({value: this.scrollValue._value,});
    }

    onContainerLayout(e) {
        this._containerMeasurements = e.nativeEvent.layout;
        this._updateView({value: this.scrollValue._value,});
    }
};

export default ScrollableTabs;
ScrollableTabs.propTypes = {
    goToPage: PropTypes.func,
    activeTab: PropTypes.number,
    tabs: PropTypes.array,
    backgroundColor: PropTypes.string,
    activeTextColor: PropTypes.string,
    inactiveTextColor: PropTypes.string,
    scrollOffset: PropTypes.number,
    style: PropTypes.object,
    tabStyle: PropTypes.object,
    tabsContainerStyle: PropTypes.object,
    textStyle: Text.propTypes.style,
    renderTab: PropTypes.func,
    underlineStyle: PropTypes.object,
    onScroll: PropTypes.func,
};
ScrollableTabs.defaultPropTypes = {
    scrollOffset: 52,
    activeTextColor: 'navy',
    inactiveTextColor: 'black',
    backgroundColor: null,
    style: {},
    tabStyle: {},
    tabsContainerStyle: {},
    underlineStyle: {},
    activeTab: 0
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
        justifyContent: 'space-around',
    },
});