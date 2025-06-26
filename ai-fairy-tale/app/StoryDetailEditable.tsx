import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';

interface Props {
  route: {
    params: {
      id: number;
      story: string;
      instruction: string;
      keywords: string;
      imageUri: string;
      version: 'child' | 'teen';
    };
  };
}

export default function StoryDetailEditable({ route }: Props) {
  const { id, story, instruction, keywords, imageUri, version } = route.params;

  const [modifiedStory, setModifiedStory] = useState(story);
  const [editText, setEditText] = useState('');

  const handleReplaceEnding = () => {
    if (!editText.trim()) {
      Alert.alert('엔딩 문장을 입력해주세요.');
      return;
    }
    const sentences = modifiedStory.trim().split(/(?<=[.!?])\s+/);
    const body = sentences.slice(0, -1).join(' ');
    const newStory = body + ' ' + editText.trim();
    setModifiedStory(newStory);
  };

  const handleAppendText = () => {
    if (!editText.trim()) {
      Alert.alert('이어 쓸 내용을 입력해주세요.');
      return;
    }
    const newStory = modifiedStory.trim() + '\n' + editText.trim();
    setModifiedStory(newStory);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `http://192.168.0.102:5000/update_story/${id}?version=${version}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ story: modifiedStory }),
        }
      );
      const json = await response.json();
      Alert.alert('저장 완료', json.message);
    } catch (err) {
      console.error(err);
      Alert.alert('저장 실패', '서버와의 연결에 실패했습니다.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>✏️ 동화 수정하기</Text>
      <Text style={styles.label}>요청: {instruction}</Text>
      <Text style={styles.label}>키워드: {keywords}</Text>

      <TextInput
        style={styles.storyBox}
        multiline
        value={modifiedStory}
        onChangeText={setModifiedStory}
      />

      <TextInput
        style={styles.input}
        placeholder="새 결말 또는 이어 쓸 내용을 작성하세요"
        multiline
        value={editText}
        onChangeText={setEditText}
      />

      <View style={styles.buttonRow}>
        <Button title="🎬 마지막 장면 바꾸기" onPress={handleReplaceEnding} />
        <View style={{ width: 10 }} />
        <Button title="✍️ 이어 쓰기" onPress={handleAppendText} />
      </View>

      <View style={{ marginTop: 20 }}>
        <Button title="💾 수정 내용 저장" onPress={handleSave} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fffbe6',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  storyBox: {
    minHeight: 200,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    lineHeight: 22,
  },
  input: {
    minHeight: 80,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
});