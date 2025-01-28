import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { FlashList } from "@shopify/flash-list";
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

interface Brand {
    id: number;
    name: string;
}

interface Post {
    uuid: string;
    image_url: string;
    description: string;
    created_at: string;
    user: {
        username: string;
    };
    brands: Brand[];
}

export default function GlobalFeed() {
    const { data: posts, isLoading, error } = useQuery({
        queryKey: ['globalFeed'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('posts')
                .select(`
                    uuid,
                    image_url,
                    description,
                    created_at,
                    user_uuid,
                    profiles!posts_user_uuid_fkey (username),
                    post_brands (
                        brands (
                            id,
                            name
                        )
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform the data structure
            return data.map(post => ({
                ...post,
                user: post.profiles,
                brands: post.post_brands.map((pb: any) => pb.brands),
                image_url: supabase.storage
                    .from('outfits')
                    .getPublicUrl(post.image_url).data.publicUrl
            }));
        },
    });

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error loading feed</Text>
            </View>
        );
    }

    const renderPost = ({ item }: { item: Post }) => (
        <View style={styles.postContainer}>
            {/* User Header */}
            <View style={styles.postHeader}>
                <View style={styles.userInfo}>
                    <View style={styles.userIcon}>
                        <MaterialIcons name="person" size={24} color="black" />
                    </View>
                    <Text style={styles.username}>@{item.user.username}</Text>
                </View>
            </View>

            {/* Post Image */}
            <Image
                source={{ uri: item.image_url }}
                style={styles.postImage}
                contentFit="cover"
                transition={0}
            />

            {/* Brands */}
            <View style={styles.brandsContainer}>
                <Text style={styles.brandsLabel}>Featured Brands:</Text>
                <View style={styles.brandsList}>
                    {item.brands?.map((brand) => (
                        <TouchableOpacity
                            key={brand.id}
                            onPress={() => {
                                console.log("brand pressed", brand);
                                // First switch to brands tab
                                router.replace({
                                    pathname: '/(tabs)/discover/brands',
                                    params: {
                                        id: brand.id
                                    }
                                })
                            }}
                            style={styles.brandButton}
                        >
                            <Text style={styles.brandText}>{brand.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlashList
                data={posts}
                renderItem={renderPost}
                estimatedItemSize={400}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
    },
    listContainer: {
        padding: 10,
    },
    postContainer: {
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    username: {
        fontSize: 14,
        fontWeight: '600',
    },
    postImage: {
        width: '100%',
        aspectRatio: 1,
    },
    brandsContainer: {
        padding: 10,
    },
    brandsLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 5,
    },
    brandsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
    },
    brandButton: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    brandText: {
        fontSize: 12,
        color: '#000',
    },
});