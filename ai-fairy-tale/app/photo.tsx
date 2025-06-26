import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Switch,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMode } from '../context/ModeContext';
import HouseIcon from '../assets/icon/house-fill.svg';
import { useFocusEffect } from '@react-navigation/native';

const FLASK_URL = 'http://172.20.10.6:5000'; // ✅ SavedStories.tsx와 동일하게 통일

export default function Photo() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [instruction, setInstruction] = useState('');
  const [storyKo, setStoryKo] = useState('');
  const [storyEn, setStoryEn] = useState('');
  const [useEnglish, setUseEnglish] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autoTTS, setAutoTTS] = useState(true);
  const { mode } = useMode();
  const router = useRouter();
  const timeoutIds = useRef<number[]>([]);

  const resetAllStates = () => {
    setImageUri(null);
    setInstruction('');
    setStoryKo('');
    setStoryEn('');
    setLoading(false);
    setIsSpeaking(false);
  };

  useFocusEffect(
    useCallback(() => {
      resetAllStates();
    }, [])
  );

  const pickImage = async () => {
    resetAllStates();
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert('사진 접근 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 1, allowsEditing: true });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      stopTTS();
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      alert('카메라 접근 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 1, allowsEditing: true });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      stopTTS();
    }
  };

  const uploadImageToFlask = async () => {
    if (!imageUri || !instruction.trim()) {
      alert('사진과 설명을 입력해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      name: 'uploaded.jpg',
      type: 'image/jpeg',
    } as any);
    formData.append('instruction', instruction);
    formData.append('version', mode === 'teen' ? 'teen' : 'child');

    try {
      setLoading(true);
      const response = await fetch(`${FLASK_URL}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formData,
      });
      const json = await response.json();
      setStoryKo(json.story || '이야기 생성에 실패했어요.');
      setStoryEn(json.story_en || 'Translation failed.');
      if (autoTTS) setTimeout(() => speakStory(), 500);
    } catch (e) {
      console.error(e);
      setStoryKo('서버 오류로 실패했어요.');
    } finally {
      setLoading(false);
    }
  };

  const speakStory = () => {
    stopTTS();
    const text = useEnglish ? storyEn : storyKo;
    if (!text) return;
    const lines = text.split(/(?<=[.?!])\s+/);
    setIsSpeaking(true);
    lines.forEach((line, idx) => {
      const timeout = setTimeout(() => {
        Speech.speak(line.trim(), {
          language: useEnglish ? 'en' : 'ko',
          pitch: idx % 2 === 0 ? 1.2 : 0.9,
          rate: 0.95,
          onDone: () => { if (idx === lines.length - 1) setIsSpeaking(false); },
          onStopped: () => setIsSpeaking(false),
        });
      }, idx * 1000);
      timeoutIds.current.push(timeout as unknown as number);
    });
  };

  const stopTTS = () => {
    Speech.stop();
    timeoutIds.current.forEach((id) => clearTimeout(id));
    timeoutIds.current = [];
    setIsSpeaking(false);
  };

  const goToSavedStories = () => {
    router.push('/SavedStories'); // ✅ 수정 완료
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={100}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor: mode === 'baby' ? '#fcf172' : '#b9e561' }]}>
          <TouchableOpacity style={styles.homeButton} onPress={() => router.push('/choosemode')}>
            <HouseIcon width={28} height={28} />
          </TouchableOpacity>
          <Image source={require('../assets/images/welcome_logo.png')} style={styles.logoImage} />
          <Text style={styles.title}> : 사진 이야기가 되다</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.customButton} onPress={pickImage}>
              <Text style={styles.buttonText}>갤러리</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.customButton} onPress={takePhoto}>
              <Text style={styles.buttonText}>카메라</Text>
            </TouchableOpacity>
          </View>

          {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

          {imageUri && (
            <>
              <TextInput
                style={styles.input}
                placeholder="예: 이 그림으로 이야기를 만들어줘"
                placeholderTextColor="#aaa"
                multiline
                value={instruction}
                onChangeText={setInstruction}
                textAlignVertical="top"
              />
              <TouchableOpacity style={styles.customButton} onPress={uploadImageToFlask}>
                <Text style={styles.buttonText}>이야기 생성</Text>
              </TouchableOpacity>
            </>
          )}

          {loading && <ActivityIndicator size="large" color="#888" style={{ marginTop: 20 }} />}

          {storyKo && (
            <>
              <View style={styles.storyBox}>
                <Text style={styles.storyText}>{useEnglish ? storyEn : storyKo}</Text>
                <View style={styles.languageToggle}>
                  <Text>🇰🇷</Text>
                  <Switch value={useEnglish} onValueChange={setUseEnglish} />
                  <Text>🇺🇸</Text>
                </View>
                <TouchableOpacity onPress={isSpeaking ? stopTTS : speakStory}>
                  <Text style={styles.buttonText}>{isSpeaking ? '⏹️' : '📢'}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.customButton1} onPress={goToSavedStories}>
                <Text style={styles.buttonText}>생성된 이야기 모아보기</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 70,
    alignItems: 'center',
    flexGrow: 1,
  },
  homeButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    bottom: 45,
    fontWeight: 'bold',
  },
  image: {
    width: 250,
    height: 250,
    bottom: 25,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#5e4127',
  },
  input: {
    borderWidth: 2,
    borderColor: '#5e4127',
    width: '100%',
    padding: 12,
    minHeight: 80,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginTop: 5,
    marginBottom: 10,
  },
  storyBox: {
    marginTop: 30,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  storyText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    bottom: 55,
    gap: 10,
  },
  customButton: {
    backgroundColor: '#5e4127',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    top: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logoImage: {
    width: 130,
    height: 130,
  },
  customButton1: {
    backgroundColor: '#5e4127',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    top: 10,
  },
});
