import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './App';
import HouseIcon from '../assets/icon/house-fill.svg';
import { useMode } from '../context/ModeContext';

const FLASK_URL = 'http://172.20.10.6:5000';

export default function SavedStories() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const router = useRouter();
  const { mode } = useMode(); // 'baby' or 'teen'
  const [stories, setStories] = useState<any[]>([]);

  const fetchStories = () => {
    fetch(`${FLASK_URL}/stories?version=${mode === 'teen' ? 'teen' : 'child'}`)
      .then((res) => res.json())
      .then((data) => setStories(data))
      .catch(() => Alert.alert('오류', '목록 불러오기 실패'));
  };

  useEffect(fetchStories, [mode]);

  const deleteStory = (id: number) => {
    fetch(`${FLASK_URL}/delete_story/${id}?version=${mode === 'teen' ? 'teen' : 'child'}`, {
      method: 'DELETE',
    })
      .then(() => fetchStories())
      .catch(() => Alert.alert('삭제 실패'));
  };

  const bookmarkStory = (id: number) => {
    fetch(`${FLASK_URL}/bookmark_story/${id}?version=${mode === 'teen' ? 'teen' : 'child'}`, {
      method: 'POST',
    })
      .then(() => fetchStories())
      .catch(() => Alert.alert('북마크 실패'));
  };

  const goToDetail = (
    story: string,
    instruction: string,
    keywords: string,
    imageUri: string
  ) => {
    navigation.navigate('StoryDetail', {
      story,
      instruction,
      keywords,
      fromSaved: true,
      imageUri,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: mode === 'baby' ? '#fcf172' : '#b9e561' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.homeButton} onPress={() => router.push('/choosemode')}>
          <HouseIcon width={28} height={28} />
        </TouchableOpacity>

        <Text style={styles.title}>생성된 동화 목록</Text>

        {stories.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.storyItem}
            onPress={() =>
              goToDetail(item.story, item.instruction, item.keywords, item.image_uri)
            }
          >
            {item.image_uri && (
              <Image source={{ uri: item.image_uri }} style={styles.thumbnail} />
            )}
            <Text style={styles.storyPreview}>{item.story.slice(0, 40)}...</Text>
            <Text style={styles.meta}>({item.version}용)</Text>

            <View style={styles.actionRow}>
              <TouchableOpacity onPress={() => deleteStory(item.id)}>
                <Text style={styles.actionText}>🗑 삭제</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => bookmarkStory(item.id)}>
                <Text style={styles.actionText}>
                  {item.is_bookmarked ? '❤️ 좋아요 눌림' : '🤍 좋아요'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 80,
    flexGrow: 1, // ✅ 스크롤 영역도 전체 배경색 포함되도록
  },
  homeButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  storyItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  storyPreview: {
    fontSize: 16,
    marginVertical: 5,
  },
  meta: {
    fontSize: 12,
    color: '#666',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  actionText: {
    fontSize: 14,
    color: '#007bff',
  },
  thumbnail: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    resizeMode: 'cover',
  },
});
