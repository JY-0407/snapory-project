// ✅ index.tsx - 시작(웰컴) 페이지
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  const goToChooseMode = () => {
    router.push('/choosemode');
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Image source={require('../assets/images/welcome_duck.png')} style={styles.duckImage} />
      <Image source={require('../assets/images/welcome_logo.png')} style={styles.logoImage} />
      <TouchableOpacity style={styles.button} onPress={goToChooseMode}>
  <Text style={styles.buttonText}>나만의 동화 만들기</Text>
</TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcf172',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  duckImage: {
    width: 450,
    height: 450,
    resizeMode: 'contain',
    // marginBottom: 10,
    top: 250,
  },
  logoImage: {
    width: 400,
    height: 180,
    resizeMode: 'contain',
    marginBottom: 300,
  },
  button: {
    backgroundColor: '#5e4127',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    elevation: 4,
    bottom: 150,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});


// ✅ photo.tsx - 기존 index.tsx의 촬영/동화 기능 페이지로 이동
// 👉 너가 줬던 index 코드를 그대로 복사해서 저장하면 됨
// 단, export default function Index() → export default function Photo() 로 이름만 변경

// 이후 expo-router의 _layout.tsx에 다음 스크린 등록:
// <Stack.Screen name="photo" options={{ title: 'AI 동화 생성기' }} />
