import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useSession } from '../../context/SessionContext';
import { supabase } from '@/lib/supabase';  // Assuming you're using Supabase to fetch posts

export default function Profile() {
    const { signOut, user } = useSession();  // Assuming session provides user information
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    interface Post {
        uuid: string;
        user_uuid: string;
        created_at: string;
        image_url: string;
        description: string;
    }

    useEffect(() => {
        // Fetch the user's posts from the database
        const fetchPosts = async () => {
            try {
                console.log(user)
                if (user) {
                    const { data, error } = await supabase
                        .from('posts')  // Assuming posts are stored in a 'posts' table
                        .select('uuid, user_uuid, created_at, image_url, description')  // Adjust according to your table schema
                        .eq('user_uuid', user.id);  // Filter posts by the current user's ID

                    if (error) throw error;

                    // Get image URLs from the storage bucket
                    for (const post of data) {
                        console.log(post.image_url)
                        const { data } = await supabase.storage
                            .from('outfits')
                            .getPublicUrl(post.image_url);
                        if (data) {
                            post.image_url = data.publicUrl;
                        }
                    }

                    console.log(data)
                    setPosts(data as any || []);
                }
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchPosts();
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
    }, [user]);  // Re-run when the user changes

    function ShowPosts({ posts }) {
        return (
            <View>
                {posts.map((post) => (
                    console.log(post.image_url),
                    <TouchableOpacity key={post.uuid} style={styles.postItem}>
                        <Image source={{ uri: post.image_url }} style={styles.image} />
                        <Text style={styles.postTitle}>{post.description}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        )
    }
    //https://yhnamwhotpnhgcicqpmd.supabase.co/storage/v1/object/sign/outfits/outfits/d517ed74-5bfe-4e3f-b2ec-e06549ec43ee/937a866c-ebfd-4cf8-8c2f-7698bcc7166f.jpg
    // https://yhnamwhotpnhgcicqpmd.supabase.co/storage/v1/object/public/outfits/outfits/d517ed74-5bfe-4e3f-b2ec-e06549ec43ee/937a866c-ebfd-4cf8-8c2f-7698bcc7166f.jpg
    // https://yhnamwhotpnhgcicqpmd.supabase.co/storage/v1/object/sign/outfits/outfits/d517ed74-5bfe-4e3f-b2ec-e06549ec43ee/937a866c-ebfd-4cf8-8c2f-7698bcc7166f.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJvdXRmaXRzL291dGZpdHMvZDUxN2VkNzQtNWJmZS00ZTNmLWIyZWMtZTA2NTQ5ZWM0M2VlLzkzN2E4NjZjLWViZmQtNGNmOC04YzJmLTc2OThiY2M3MTY2Zi5qcGciLCJpYXQiOjE3Mzc2MDYzOTYsImV4cCI6MTczODIxMTE5Nn0.nC8mUKmdOvnAyTjmi4FJPqSPIpfUPBuskNuDPqQZ9BU&t=2025-01-23T04%3A26%3A36.272Z

    const renderPostItem = ({ item }: { item: Post }) => (
        <View style={styles.postItem}>
            <Image source={{ uri: item.image_url }} style={styles.image} />
            <Text style={styles.postTitle}>{item.description}</Text>
        </View>
    );

    console.log(posts)

    return (
        <View>
            {/* <Text style={styles.postTitle}>Profile Screen</Text> */}

            {/* Display loading indicator */}
            {loading ? (
                <Text>Loading your posts...</Text>
            ) : (
                <>
                    <FlatList
                        data={posts}
                        renderItem={renderPostItem}
                        keyExtractor={(item) => item.uuid}
                        numColumns={2}  // Display posts in two columns
                    />
                </>
            )}

            {/* Sign Out Button */}
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
        margin: 10,
        backgroundColor: '#f1f1f1',
        borderRadius: 8,
        overflow: 'hidden',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: 150,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    postTitle: {
        fontSize: 16,
        padding: 10,
        textAlign: 'center',
    },
});
