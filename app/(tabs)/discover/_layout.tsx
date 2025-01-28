

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    useWindowDimensions,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated
} from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import { router, useLocalSearchParams } from 'expo-router';
import GlobalScreen from './global';
import FriendsScreen from './friends';
import BrandsScreen from './brands';

const CustomTabBar = ({ navigationState, position, setIndex }: any) => {
    const layout = useWindowDimensions();
    const tabWidth = layout.width / 3; // Explicitly set for 3 tabs

    // Create a new animated value for manual control
    const indicatorPosition = useRef(new Animated.Value(navigationState.index * tabWidth)).current;

    // Update indicator position when index changes
    useEffect(() => {
        Animated.spring(indicatorPosition, {
            toValue: navigationState.index * tabWidth,
            useNativeDriver: true,
            tension: 300,
            friction: 35,
        }).start();
    }, [navigationState.index]);

    return (
        <View style={styles.tabBar}>
            {/* Animated Indicator */}
            <Animated.View
                style={[
                    styles.indicator,
                    {
                        transform: [{ translateX: indicatorPosition }],
                        width: tabWidth,
                    }
                ]}
            />

            {/* Tab Buttons */}
            {navigationState.routes.map((route: any, i: number) => {
                const isActive = navigationState.index === i;

                return (
                    <TouchableOpacity
                        key={route.key}
                        style={[styles.tabItem, { width: tabWidth }]}
                        // onPress={() => setIndex(i)}
                        onPress={() => {
                            console.log("tab pressed", route.key);
                            setIndex(i);
                            router.push({
                                pathname: "/(tabs)/discover",
                                params: {
                                    tab: route.key
                                }
                            })
                        }}
                    >
                        <Text style={[
                            styles.tabText,
                            { color: isActive ? '#000' : '#666' }
                        ]}>
                            {route.title}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

export default function DiscoverLayout() {
    const { tab } = useLocalSearchParams();
    console.log("tab", tab);
    const { brand_id } = useLocalSearchParams();
    console.log("brand_id", brand_id);
    const layout = useWindowDimensions();

    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'global', title: 'Global' },
        { key: 'friends', title: 'Friends' },
        { key: 'brands', title: 'Brands' },
    ]);

    useEffect(() => {
        if (tab) {
            const newIndex = routes.findIndex(route => route.key === tab.toLowerCase());
            if (newIndex !== -1) {
                setIndex(newIndex);
            }
        }
    }, [tab]);

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
    },
    indicator: {
        position: 'absolute',
        bottom: 0,
        height: 2,
        backgroundColor: '#000',
    }
});