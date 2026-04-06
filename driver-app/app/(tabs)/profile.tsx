import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { APP_COLORS } from '../../src/constants/theme';

const PRIMARY = '#00B14F';
const PRIMARY_DARK = '#007A37';
const PRIMARY_SOFT = '#E8F8EF';
const DANGER = '#EF4444';
const DANGER_SOFT = '#FEF2F2';

type MenuItem = {
  icon: string;
  label: string;
  onPress?: () => void;
};

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/auth' as any);
  };

  const menuItems: MenuItem[] = [
    { icon: 'clipboard-text-outline', label: 'Đơn hàng của tôi' },
    { icon: 'ticket-percent-outline', label: 'Voucher của tôi' },
    { icon: 'account-cog-outline', label: 'Quản lý tài khoản' },
    { icon: 'wallet-outline', label: 'Phương thức thanh toán' },
    { icon: 'phone-outline', label: 'Hỗ trợ' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={22} color="#546E7A" />
        </Pressable>

        <Text style={styles.pageTitle}>Thông tin tài khoản</Text>

        <Pressable style={styles.iconBtn}>
          <MaterialCommunityIcons name="bell-outline" size={20} color="#546E7A" />
          <View style={styles.bellBadge}>
            <Text style={styles.bellBadgeText}>2</Text>
          </View>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile hero */}
        <View style={styles.profileHero}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons name="account" size={48} color={PRIMARY_DARK} />
            </View>
          </View>
          <Text style={styles.userName}>{user?.full_name || 'Tài xế FastDeli'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'driver@fastdeli.vn'}</Text>

          <View style={styles.driverBadge}>
            <MaterialCommunityIcons name="truck-fast" size={12} color={PRIMARY} />
            <Text style={styles.driverBadgeText}>Tài xế đã xác minh</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>48</Text>
            <Text style={styles.statLbl}>Đơn hoàn thành</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>4.9 ★</Text>
            <Text style={styles.statLbl}>Đánh giá</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>12</Text>
            <Text style={styles.statLbl}>Ngày hoạt động</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [
                styles.menuItem,
                index === menuItems.length - 1 && styles.menuItemLast,
                pressed && styles.menuItemPressed,
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuIconBox}>
                <MaterialCommunityIcons name={item.icon as any} size={20} color={PRIMARY} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#CBD5E0" />
            </Pressable>
          ))}
        </View>

        {/* Logout */}
        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.85 }]}
          onPress={handleLogout}
        >
          <MaterialCommunityIcons name="logout" size={20} color={DANGER} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </Pressable>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F7F9FC',
    borderWidth: 1,
    borderColor: '#EEF2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  bellBadge: {
    position: 'absolute',
    right: -4,
    top: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: DANGER,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 0,
    borderColor: '#fff',
  },
  bellBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },

  profileHero: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    padding: 3,
    backgroundColor: PRIMARY_SOFT,
    borderWidth: 2,
    borderColor: '#A7F3C4',
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#DCF5E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#78909C',
    marginBottom: 12,
  },
  driverBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: PRIMARY_SOFT,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#A7F3C4',
  },
  driverBadgeText: {
    fontSize: 12,
    color: PRIMARY_DARK,
    fontWeight: '700',
  },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 18,
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    marginBottom: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 3,
  },
  statLbl: {
    fontSize: 11,
    color: '#90A4AE',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#EEF2F7',
  },

  menuSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemPressed: {
    backgroundColor: '#F7F9FC',
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: PRIMARY_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 14,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: DANGER_SOFT,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    fontSize: 15,
    color: DANGER,
    fontWeight: '700',
  },
});