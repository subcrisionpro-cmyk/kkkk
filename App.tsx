// Main App entry point - Offline Chat with Gemma AI
import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import ModelLoader from './src/screens/ModelLoader';
import ChatScreen from './src/screens/ChatScreen';
import { COLORS } from './src/theme';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'loader' | 'chat'>(
    'loader',
  );
  const [modelName, setModelName] = useState('');

  const handleModelLoaded = (modelPath: string, name: string) => {
    setModelName(name);
    setCurrentScreen('chat');
  };

  const handleBackToLoader = () => {
    setCurrentScreen('loader');
  };

  return (
    <>
      <StatusBar
        backgroundColor={COLORS.surface}
        barStyle="light-content"
        translucent={false}
      />
      {currentScreen === 'loader' ? (
        <ModelLoader onModelLoaded={handleModelLoaded} />
      ) : (
        <ChatScreen modelName={modelName} onBack={handleBackToLoader} />
      )}
    </>
  );
};

export default App;
