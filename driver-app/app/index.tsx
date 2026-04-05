import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../src/context/AuthContext';

export default function IndexScreen() {
  const { isHydrating, token, user } = useAuth();

  if (isHydrating) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (token && user?.role === 'driver') {
    return <Redirect href={"/(tabs)/home" as any} />;
  }

  return <Redirect href="/(auth)/auth" />;
}
