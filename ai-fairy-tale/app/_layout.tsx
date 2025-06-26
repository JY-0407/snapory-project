import { Stack } from 'expo-router';
import { ModeProvider } from '../context/ModeContext';

export default function Layout() {
  return (
    <ModeProvider>
      <Stack initialRouteName="index">
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="choosemode" options={{ headerShown: false }} /> 
        <Stack.Screen name="photo" options={{ headerShown: false }} /> 
        <Stack.Screen name="SavedStories" options={{ headerShown: false }} /> 
        <Stack.Screen name="StoryDetail" options={{ headerShown: false }} /> 
      </Stack>
    </ModeProvider>
  );
}