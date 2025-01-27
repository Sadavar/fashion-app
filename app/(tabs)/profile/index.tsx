import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity } from "react-native";
import { useSession } from '@/context/SessionContext';
import { supabase } from '@/lib/supabase';
import { ExternalPathString, router } from 'expo-router';
import { Image } from 'expo-image';
import { FlashList } from "@shopify/flash-list";

export default function Profile() {
    const { signOut, user, username } = useSession();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    interface Post {
        uuid: string;
        user_uuid: string;
        created_at: string;
        image_url: string;
        description: string;
    }

    const blurhash =
        'L5KK==D%00xu~qayIUj[00of-;fP';

    useEffect(() => {
        const fetchPostsStatic = async () => {
            setPosts(
                [{ "created_at": "2025-01-23T04:12:56.770412+00:00", "description": "Cool description", "image_url": "https://yhnamwhotpnhgcicqpmd.supabase.co/storage/v1/object/public/outfits/outfits/d517ed74-5bfe-4e3f-b2ec-e06549ec43ee/937a866c-ebfd-4cf8-8c2f-7698bcc7166f.jpg", "user_uuid": "d517ed74-5bfe-4e3f-b2ec-e06549ec43ee", "uuid": "86448d0a-7ec9-446d-b640-77ae4800d905" }, { "created_at": "2025-01-23T04:47:31.036617+00:00", "description": "Sick fit", "image_url": "https://yhnamwhotpnhgcicqpmd.supabase.co/storage/v1/object/public/outfits/outfits/d517ed74-5bfe-4e3f-b2ec-e06549ec43ee/712cda09-d25b-4a9e-aa25-6fdf46dd8b87.jpg", "user_uuid": "d517ed74-5bfe-4e3f-b2ec-e06549ec43ee", "uuid": "48041862-5fd0-49e0-b777-c2f5a7286968" }, { "created_at": "2025-01-23T04:59:26.058764+00:00", "description": "Another cool description", "image_url": "https://yhnamwhotpnhgcicqpmd.supabase.co/storage/v1/object/public/outfits/outfits/d517ed74-5bfe-4e3f-b2ec-e06549ec43ee/9a891bfa-2777-464c-b68e-75c70ab99dc7.jpg", "user_uuid": "d517ed74-5bfe-4e3f-b2ec-e06549ec43ee", "uuid": "dffa1388-3e1b-4d2a-8c2a-77e3a3ca1937" }, { "created_at": "2025-01-23T05:00:42.432214+00:00", "description": "wow nice", "image_url": "https://yhnamwhotpnhgcicqpmd.supabase.co/storage/v1/object/public/outfits/outfits/d517ed74-5bfe-4e3f-b2ec-e06549ec43ee/c3654860-81d6-4c5b-995f-4f55d4d33473.jpg", "user_uuid": "d517ed74-5bfe-4e3f-b2ec-e06549ec43ee", "uuid": "127aca16-05c7-4809-8bc9-ef9e5cd9a558" }]
            )
            setLoading(false);
        }
        const fetchPosts = async () => {
            try {
                console.log(user)
                if (user) {
                    const { data, error } = await supabase
                        .from('posts')
                        .select('uuid, user_uuid, created_at, image_url, description')
                        .eq('user_uuid', user.id);

                    if (error) throw error;

                    // Get image URLs from the storage bucket
                    for (const post of data) {
                        const { data } = await supabase.storage
                            .from('outfits')
                            .getPublicUrl(post.image_url);
                        if (data) {
                            post.image_url = data.publicUrl;
                        }
                    }

                    setPosts(data as any || []);
                    console.log(data)
                }
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            // fetchPosts();
            fetchPostsStatic();
        }

        // Subscribe to real-time changes (INSERT) on the 'posts' table
        const subscription = supabase
            .channel('posts')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
                console.log('New post added, checking for changes', payload);
                fetchPosts();  // Fetch posts again to update the list
            })
            .subscribe();

        // Clean up the subscription when the component is unmounted or when the user changes
        return () => {
            subscription.unsubscribe();
        };

    }, [user]);


    const renderPostItem = ({ item }: { item: Post }) => (
        <TouchableOpacity
            style={styles.postItem}
            onPress={() => router.push('/(tabs)/profile/test' as ExternalPathString)}
        >
            <Image
                source={{ uri: item.image_url }}
                style={styles.image}
                placeholder={{}}
                contentFit="cover"
                transition={100}
            />
            <Text style={styles.postTitle}>{item.description}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', padding: 20 }}>
                @{username}
            </Text>

            {loading ? (
                <Text>Loading your posts...</Text>
            ) : (
                <FlashList
                    data={posts}
                    renderItem={renderPostItem}
                    keyExtractor={(item) => item.uuid}
                    numColumns={3}
                    estimatedItemSize={124}
                />
            )}
            <Button
                title="Sign Out"
                onPress={signOut}
                color="#FF3B30"
            />
        </View>
    );
}

// Styles for the grid and post items
const styles = StyleSheet.create({
    grid: {
        paddingHorizontal: 10,
        marginTop: 20,
    },
    postItem: {
        flex: 1,
        margin: 1,
        backgroundColor: '#f1f1f1',
        overflow: 'hidden',
        width: '33%',
        aspectRatio: 1,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    postTitle: {
        fontSize: 16,
        padding: 10,
        textAlign: 'center',
    },
});
