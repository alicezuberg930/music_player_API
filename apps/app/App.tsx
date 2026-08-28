import './global.css';
import { PortalHost } from '@/components/primitives/portal';
import { Toaster } from '@/components/ui/toast';
import { ReduxProvider } from '@/providers/redux-provider';
import { MainScreen } from '@/screens/main-screen';
import { StatusBar, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <ReduxProvider>
      <SafeAreaProvider>
        <View className={isDarkMode ? 'dark flex-1 bg-background' : 'flex-1 bg-background'}>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <AppContent />
          <Toaster />
          <PortalHost />
        </View>
      </SafeAreaProvider>
    </ReduxProvider>
  );
}

function AppContent() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1"
      style={{
        paddingTop: insets.top,
        paddingRight: insets.right,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
      }}
    >
      <MainScreen />
    </View>
  );
}

export default App;
