import React, { useEffect, useState } from 'react';
import { Button, ScrollView, TextInput, Image, TouchableWithoutFeedback, View, Keyboard } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/ThemedText';
import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSession } from '@/context/SessionContext';
import uuid from 'react-native-uuid';

export default function PostScreen() {
    const [image, setImage] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [brandsInput, setBrandsInput] = useState('');  // New state for brands
    const [loading, setLoading] = useState(false);
    const context = useSession();

    useEffect(() => {
        console.log('PostScreen mounted');
    }, []);

    const pickImage = async () => {
        console.log('Picking image...');
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            console.log('Image selected:', result.assets[0].uri);
            setImage(result.assets[0].uri);
        } else {
            console.log('Image selection canceled');
        }
    };

    const uploadPost = async () => {
        if (!image) {
            console.log('No image selected, cannot proceed with upload');
            return;
        }

        setLoading(true);
        console.log('Uploading post...');

        try {
            const userID = context.user?.id;
            if (!userID) {
                console.log('User not found');
                throw new Error('User not found');
            }
            console.log('User ID:', userID);

            const file_id = uuid.v4().toString();
            const fileName = `outfits/${userID}/${file_id}.jpg`;
            console.log('Uploading image to Supabase Storage with file name:', fileName);

            const base64 = await fetch(image).then(res => res.blob())
                .then(blob => new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                }));

            console.log('Base64 image data prepared for upload');
            const { error: uploadError } = await supabase.storage
                .from('outfits')
                .upload(fileName, decode(base64.split(',')[1]), {
                    contentType: 'image/jpeg'
                });

            if (uploadError) {
                console.log('Image upload failed:', uploadError);
                throw uploadError;
            }

            console.log('Image uploaded successfully');
            console.log('Inserting post record into database...');

            const { data: postData, error: postError } = await supabase
                .from('posts')
                .insert([{
                    image_url: fileName,
                    description,
                    user_uuid: userID,  // Ensure user is associated with post
                }])
                .select('uuid')
                .single();

            if (postError) {
                console.log('Failed to insert post record:', postError);
                throw postError;
            }

            console.log('Post record created with UUID:', postData.uuid);

            // Parse brands input
            const brands = brandsInput
                .split(',')
                .map(brand => brand.trim())
                .filter(brand => brand.length > 0);
            console.log('Parsed brands:', brands);

            for (const brandName of brands) {
                console.log(`Checking if brand "${brandName}" exists...`);
                // Check if the brand exists, otherwise insert
                const { data: brandData, error: brandError } = await supabase
                    .from('brands')
                    .upsert([{ name: brandName }], { onConflict: 'name' })
                    .select('id')
                    .single();

                if (brandError) {
                    console.log(`Failed to handle brand "${brandName}":`, brandError);
                    throw brandError;
                }

                console.log(`Brand "${brandName}" handled with ID: ${brandData.id}`);

                // Insert into the post_brands table
                const { error: postBrandError } = await supabase
                    .from('post_brands')
                    .insert([{
                        post_uuid: postData.uuid,
                        brand_id: brandData.id,
                    }]);

                if (postBrandError) {
                    console.log('Failed to associate brand with post:', postBrandError);
                    throw postBrandError;
                }

                console.log(`Brand "${brandName}" associated with post successfully`);
            }

            // Reset form after successful upload
            setImage(null);
            setDescription('');
            setBrandsInput('');
            console.log('Post created successfully');
            alert('Post created successfully!');

        } catch (error) {
            console.error('Error during post creation:', error);
            alert('Failed to create post');
        } finally {
            setLoading(false);
            console.log('Loading finished');
        }
    };

    return (
        <KeyboardAwareScrollView>
            <ThemedText style={{ fontSize: 24, marginBottom: 20 }}>Post Outfit</ThemedText>

            <Button
                title={image ? "Change Photo" : "Select Photo"}
                onPress={pickImage}
                disabled={loading}
            />

            {image && (
                <Image
                    source={{ uri: image }}
                    style={{ width: '100%', height: 300, marginVertical: 20 }}
                    resizeMode="contain"
                />
            )}

            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={{ flex: 1 }}>
                    <TextInput
                        placeholder="Add description..."
                        value={description}
                        onChangeText={setDescription}
                        style={{
                            borderWidth: 1,
                            borderColor: '#ccc',
                            borderRadius: 8,
                            padding: 12,
                            marginVertical: 20
                        }}
                        multiline
                    />

                    {/* New input for brands */}
                    <TextInput
                        placeholder="Add brands (comma separated)"
                        value={brandsInput}
                        onChangeText={setBrandsInput}
                        style={{
                            borderWidth: 1,
                            borderColor: '#ccc',
                            borderRadius: 8,
                            padding: 12,
                            marginVertical: 20
                        }}
                    />
                </View>
            </TouchableWithoutFeedback>

            <Button
                title="Post Outfit"
                onPress={uploadPost}
                disabled={!image || loading}
            />
        </KeyboardAwareScrollView>
    );
}
