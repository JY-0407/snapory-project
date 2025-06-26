import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useMode } from '../context/ModeContext';
import { useRouter } from 'expo-router';

export default function ChooseMode() {
  const { mode, toggleMode } = useMode();
  const router = useRouter();
  const [showDescription, setShowDescription] = useState(false);

  const backgroundColor = mode === 'baby' ? '#fcf172' : '#b9e561';

  // ✅ 이미지 버튼 경로 설정
  const galleryImage = mode === 'baby'
    ? require('../assets/images/baby_duck_lib.png')
    : require('../assets/images/child_duck_lib.png');

  const storyImage = mode === 'baby'
    ? require('../assets/images/baby_duck_photo.png')
    : require('../assets/images/child_duck_photo.png');

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* 좌측 상단 모드 박스 */}
      <View style={styles.topLeftWrapper}>
        <View style={styles.modeBox}>
          <Image source={require('../assets/images/baby.png')} style={styles.modeImage} />
          <TouchableOpacity style={styles.toggleWrapper} onPress={toggleMode}>
            <View style={[styles.toggleCircle, mode === 'teen' && styles.toggleRight]} />
          </TouchableOpacity>
          <Image source={require('../assets/images/child.png')} style={styles.modeImage} />
          <TouchableOpacity style={styles.infoCircle} onPress={() => setShowDescription(prev => !prev)}>
            <Text style={styles.infoText}>?</Text>
          </TouchableOpacity>
        </View>

        {showDescription && (
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>영유아 모드 : 4세~8세 추천</Text>
            <Text style={styles.descriptionText}>청소년 모드 : 9세~13세 추천</Text>
          </View>
        )}
      </View>

      {/* ✅ 위아래 이미지 버튼 */}
      <View style={styles.buttonWrapper}>
        <TouchableOpacity onPress={() => router.push('/SavedStories')} style={styles.imageButton}>
          <Image source={galleryImage} style={styles.image} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/photo')} style={styles.imageButton}>
          <Image source={storyImage} style={styles.image} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  topLeftWrapper: {
    position: 'absolute',
    top: 60,
    left: 0,
  },
  modeBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginHorizontal: 6,
  },
  toggleWrapper: {
    width: 62,
    height: 30,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 3,
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#5e4127',
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#5e4127',
    position: 'absolute',
    left: 1,
    top: 1,
  },
  toggleRight: {
    left: 33,
  },
  infoCircle: {
    width: 20,
    height: 20,
    borderRadius: 15,
    backgroundColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 0,
    top: 2,
  },
  infoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  descriptionBox: {
    marginTop: 10,
    left: 10,
    backgroundColor: '#ffffffcc',
    padding: 10,
    borderRadius: 8,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: '#5e4127',
  },
  descriptionText: {
    fontSize: 14,
    color: '#333',
  },
  buttonWrapper: {
    marginTop: 180,
    alignItems: 'center',
    width: '100%',
  },
  imageButton: {
    marginVertical: 20,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
});
