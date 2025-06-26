import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from './App';
import { useMode } from '../context/ModeContext'; // ✅ 모드 가져오기

type StoryDetailRouteProp = RouteProp<RootStackParamList, 'StoryDetail'>;

export default function StoryDetail() {
  const route = useRoute<StoryDetailRouteProp>();
  const { story, instruction, keywords, imageUri } = route.params;
  const { mode } = useMode(); // ✅ 현재 모드

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: mode === 'baby' ? '#fcf172' : '#b9e561' }, // ✅ 배경색 적용
        ]}
      >
        <Image source={require('../assets/images/logo.png')} style={styles.logoImage} />
        <Image source={{ uri: imageUri }} style={styles.image} />

        <Text style={styles.label1}>📝 지시문</Text>
        <Text style={styles.text1}>{instruction}</Text>

        <Text style={styles.label1}>🔍 추출 키워드</Text>
        <Text style={styles.text1}>{keywords}</Text>

        {/* 📦 동화 내용 박스 */}
        <View style={styles.storyBox}>
          <Text style={styles.label2}>📖 동화 내용</Text>
          <Text style={styles.text2}>{story}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
    flexGrow: 1,
  },
  image: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
    borderRadius: 10,
    marginBottom: 20,
    top: 50,
  },
  label1: {
    fontSize: 16,
    fontWeight: 'bold',
    top: 45,
    marginBottom: 5,
  },
  text1: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 10,
    top: 45,
  },
  label2: {
    fontSize: 16,
    fontWeight: 'bold',
    top: 0,
    marginBottom: 5,
  },
  text2: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 10,
    top: 0,
  },
  storyBox: {
    marginTop: 60,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  logoImage: {
    width: 150,
    height: 40,
    left: 102,
    top: 35,
  },
});
