# react-native-scrollable-tab-header
Separate tab header component which gives you relevant callbacks to build your own tab implementation. Very smooth with no frame drops.

```js
<ScrollableTabs inactiveTextColor="white"
                backgroundColor={Colors.signatureBlue}
                underlineStyle={{backgroundColor:'gold'}}
                activeTextColor='white'
                ref={(ref)=>{this._scrollTabs = ref}}
                goToPage={(i)=>
                { this._recyclerlistview.scrollToIndex(i, true) }}
                tabs={["FIRST TAB", "SECOND LONG TAB"]} />

```

To update tabs call `updateOffsetExternal(currentOffset, pageWidth)` on ref of scrollable tabs.
Note: pageWidth is width of one tab scene (mostly screen width), on goToPage callback you're supposed to scroll you container to specified position.

You might also call it as `updateOffsetExternal(positionInDecimal, 1)`

For additional feature explore props of the component.

This is a modified version of 'ScrollableTabBar' component available at:
https://github.com/skv-headless/react-native-scrollable-tab-view
