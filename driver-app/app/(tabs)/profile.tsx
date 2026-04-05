import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/auth' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Profile Header */}
        <View style={styles.headerCard}>
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons name="account" size={48} color="#94a3b8" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.name}>{user?.full_name || 'Tài xế FastDeli'}</Text>
            <View style={styles.ratingRow}>
              <MaterialCommunityIcons name="star" size={16} color="#f59e0b" />
              <Text style={styles.ratingText}>5.0</Text>
              <View style={styles.dot} />
              <Text style={styles.vehicleText}>Honda Wave Alpha</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <Pressable style={styles.menuItem}>
            <MaterialCommunityIcons name="card-account-details-outline" size={24} color="#64748b" />
            <Text style={styles.menuText}>Thông tin cá nhân</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
          </Pressable>
          <Pressable style={styles.menuItem}>
            <MaterialCommunityIcons name="motorbike" size={24} color="#64748b" />
            <Text style={styles.menuText}>Phương tiện của tôi</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
          </Pressable>
          <Pressable style={styles.menuItem}>
            <MaterialCommunityIcons name="cog-outline" size={24} color="#64748b" />
            <Text style={styles.menuText}>Cài đặt ứng dụng</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
          </Pressable>
          <Pressable style={styles.menuItem}>
            <MaterialCommunityIcons name="help-circle-outline" size={24} color="#64748b" />
            <Text style={styles.menuText}>Trung tâm trợ giúp</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
          </Pressable>
        </View>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  headerCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontWeight: '600',
    color: '#334155',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#94a3b8',
    marginHorizontal: 8,
  },
  vehicleText: {
    color: '#64748b',
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#334155',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  logoutText: {
    marginLeft: 8,
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
});
