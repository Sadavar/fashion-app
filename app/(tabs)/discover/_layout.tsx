import React, { useState, useRef } from 'react';
import {
    View,
    useWindowDimensions,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated
} from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import GlobalScreen from './global';
import FriendsScreen from './friends';
import BrandsScreen from './brands';

const CustomTabBar = ({ navigationState, position, setIndex }: any) => {
    const inputRange = navigationState.routes.map((_: any, i: number) => i);
    const layout = useWindowDimensions();
    const tabWidth = layout.width / navigationState.routes.length;

    // Animate the indicator
    const translateX = position.interpolate({
        inputRange,
        outputRange: navigationState.routes.map((_: any, i: number) => i * tabWidth),
    });

    return (
        <View style={styles.tabBar}>
            <Animated.View
                style={[
                    styles.indicator,
                    {
                        transform: [{ translateX }],
                        width: tabWidth,
                    }
                ]}
            />
            {navigationState.routes.map((route: any, i: number) => {
                const opacity = position.interpolate({
                    inputRange: [i - 1, i, i + 1],
                    outputRange: [0.6, 1, 0.6],
                    extrapolate: 'clamp',
                });

                return (
                    <TouchableOpacity
                        key={route.key}
                        style={[styles.tabItem, { width: tabWidth }]}
                        onPress={() => setIndex(i)}
                    >
                        <Animated.Text style={[styles.tabText, { opacity }]}>
                            {route.title}
                        </Animated.Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

export default function DiscoverLayout() {
    const layout = useWindowDimensions();

    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'global', title: 'Global' },
        { key: 'friends', title: 'Friends' },
        { key: 'brands', title: 'Brands' },
    ]);

    const renderScene = SceneMap({
        global: GlobalScreen,
        friends: FriendsScreen,
        brands: BrandsScreen,
    });

    return (
        <View style={{ flex: 1 }}>
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: layout.width }}
                renderTabBar={(props) => (
                    <CustomTabBar {...props} setIndex={setIndex} />
                )}
                style={{ flex: 1 }}
                swipeEnabled={true}
                animationEnabled={true}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        flexDirection: 'row',
        backgroundColor: 'white',
        height: 48,
        position: 'relative',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
    },
    indicator: {
        position: 'absolute',
        bottom: 0,
        height: 2,
        backgroundColor: '#000',
    }
});