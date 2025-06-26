import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Index from './index';
import SavedStories from './SavedStories';
import StoryDetail from './StoryDetail';
import StoryDetailEditable from './StoryDetailEditable';

export type RootStackParamList = {
  Index: undefined;
  SavedStories: undefined;
  StoryDetail: {
    story: string;
    instruction: string;
    keywords: string;
    fromSaved: boolean;
    imageUri: string;
  };
  StoryDetailEditable: {
    id: number;
    story: string;
    instruction: string;
    keywords: string;
    imageUri: string;
    version: 'child' | 'teen';
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Index">
        <Stack.Screen name="Index" component={Index} options={{ title: 'AI 동화 생성기' }} />
        <Stack.Screen name="SavedStories" component={SavedStories} options={{ title: '저장된 동화' }} />
        <Stack.Screen name="StoryDetail" component={StoryDetail} options={{ title: '동화 상세' }} />
        <Stack.Screen name="StoryDetailEditable" component={StoryDetailEditable} options={{ title: '동화 수정' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}