import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#00B14F', // Grab Green
        tabBarInactiveTintColor: '#64748b',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#f1f5f9',
          borderTopWidth: 1,
          elevation: 5,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : (Platform.OS === 'android' ? 12 : 8),
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="home" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Đơn hàng',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="clipboard-list" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Ví tiền',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="wallet" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Tài khoản',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account" size={26} color={color} />,
        }}
      />
    </Tabs>
  );
}
