import { ExternalPathString, Tabs, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from '@/context/SessionContext';
import { supabase } from '@/lib/supabase';
import { ActivityIndicator, Button, Dimensions, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Image } from 'expo-image';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import { Modalize } from 'react-native-modalize';


export default function TabLayout() {
    const [loading, setLoading] = useState(true);
    const [initialRoute, setInitialRoute] = useState<string | null>(null);
    const router = useRouter();

    const { height } = Dimensions.get('window');
    const snapPoints = [height * 0.25];

    const modalizeRef = useRef<Modalize>(null);

    const [image, setImage] = useState<string | null>(null);

    const pickImage = async () => {
        console.log('Picking image...');
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            // allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        if (result.canceled) {
            console.log('Image picker cancelled');
            modalizeRef.current?.close();
            return;
        }
        if (!result.assets || !result.assets[0] || !result.assets[0].uri) {
            console.log('No image selected');
            return;
        }
        console.log('Image selected:', result.assets[0].uri);
        setImage(result.assets[0].uri);
        router.replace({ pathname: '/post', params: { image: result.assets[0].uri } });
        modalizeRef.current?.close();
    };

    const onOpen = () => {
        console.log("tab pressed")
        modalizeRef.current?.open();
    };

    useEffect(() => {
        console.log('Tab layout mounted');
        checkUser();
    }, []);

    const prefetchPosts = async (user: any) => {
        console.log("prefetching posts for user:", user.id);
        // get image_urls
        const { data: posts } = await supabase.from('posts').select('image_url').eq('user_uuid', user.id);
        console.log("posts:", posts);
        if (!posts) {
            console.log("no image urls");
            return;
        }
        try {
            // Create an array of prefetch promises
            const prefetchTasks = posts.map(async (url) => {
                // First try to load into memory cache
                try {
                    await Image.prefetch(url.image_url);
                    console.log(`Successfully prefetched: ${url.image_url}`);
                } catch (error) {
                    console.warn(`Memory cache prefetch failed for ${url.image_url}:`, error);

                    // If memory cache fails, try to download to disk cache
                    try {
                        const filename = url.image_url.split('/').pop();
                        const path = `${FileSystem.cacheDirectory}${filename}`;

                        await FileSystem.downloadAsync(url.image_url, path);
                        console.log(`Downloaded to disk cache: ${url.image_url}`);
                    } catch (diskError) {
                        console.error(`Disk cache download failed for ${url}:`, diskError);
                    }
                }
            });

            // Wait for all prefetch operations to complete
            await Promise.all(prefetchTasks);
            console.log('All images prefetched successfully');
        } catch (error) {
            console.error('Error prefetching images:', error);
        }
    }

    const checkUser = async () => {
        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.log('no user');
                setInitialRoute('/login');
            } else {
                console.log('user exists');
                // Check if user has set username
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('username')
                    .eq('id', user.id)
                    .single();

                if (!profile?.username) {
                    console.log('needs username');
                    setInitialRoute('/username');
                } else {
                    console.log('has username, going to tabs');
                    setInitialRoute('/(tabs)');
                    // prefetchPosts(user);
                }
            }
        } catch (error) {
            console.error('Error checking user:', error);
            setInitialRoute('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Only navigate when `initialRoute` is set and not loading
        if (!loading && initialRoute) {
            router.replace({ pathname: initialRoute as ExternalPathString });
        }
    }, [loading, initialRoute, router]); // Ensure this effect runs after `initialRoute` is set

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Tabs>
                <Tabs.Screen
                    name="index"
                    options={{
                        tabBarItemStyle: { display: "none" },
                    }}

                />
                <Tabs.Screen
                    name="discover"
                    options={{
                        tabBarIcon: ({ color }) => (
                            <MaterialIcons name="explore" size={30} color={color} />
                        ),
                        tabBarLabel: () => null,
                        headerTitle: 'Discover',
                    }}

                />
                <Tabs.Screen
                    name="post"
                    options={{
                        tabBarIcon: ({ color }) => (
                            <MaterialIcons name="add-box" size={30} color={color} />
                        ),
                        tabBarLabel: () => null,
                        headerTitle: 'Post',
                    }}
                    listeners={{
                        tabPress: (e) => {
                            e.preventDefault();
                            onOpen();
                        },
                    }}

                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        tabBarIcon: ({ color }) => (
                            <MaterialIcons name="person" size={30} color={color} />
                        ),
                        tabBarLabel: () => null,
                        headerTitle: 'Profile',
                    }}
                />

            </Tabs>

            <Modalize ref={modalizeRef} snapPoint={snapPoints[0]}>
                {/* Pick image from camera roll or take photo */}
                <View className="flex-col align-middle justify-center h-100 ">
                    <Button
                        title="Select from Camera Roll"
                        onPress={() => { pickImage() }}
                        disabled={loading}
                    />
                    <Button
                        title="Take Photo"
                        onPress={() => { pickImage() }}
                        disabled={loading}
                    />
                </View>
            </Modalize>

        </GestureHandlerRootView >
    );
}
