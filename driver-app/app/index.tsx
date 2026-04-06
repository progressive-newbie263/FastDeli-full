import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { APP_COLORS } from '../src/constants/theme';

export default function IndexScreen() {
  const { isHydrating, token, user } = useAuth();

  if (isHydrating) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: APP_COLORS.surface }}>
        <ActivityIndicator size="large" color={APP_COLORS.primary} />
      </View>
    );
  }

  if (token && user?.role === 'driver') {
    return <Redirect href={"/(tabs)/home" as any} />;
  }

  return <Redirect href="/(auth)/auth" />;
}
