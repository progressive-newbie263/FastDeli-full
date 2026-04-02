import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  FlatList,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import {
  getDeliveredHistory,
  getDeliveringOrders,
  getDriverProfile,
  injectMockIncomingOrder,
  updateDriverLocation,
} from '../api/driverApi';
import { DEV_MOCK_MODE, MOCK_DRIVER_ACCOUNT } from '../config/api';
import type {
  DeliveredOrderHistoryDTO,
  DeliveringOrderDTO,
  DriverProfileDTO,
} from '../domain/driverDto';
import type { RootStackParamList } from '../navigation/types';
import { clearAuthToken, getAuthToken } from '../lib/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Orders'>;
type HubTab = 'delivering' | 'history' | 'profile';

function formatMoney(v: number) {
  return `${v.toLocaleString('vi-VN')}đ`;
}

export default function OrdersScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<DeliveringOrderDTO[]>([]);
  const [history, setHistory] = useState<DeliveredOrderHistoryDTO[]>([]);
  const [profile, setProfile] = useState<DriverProfileDTO | null>(null);
  const [query, setQuery] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState<HubTab>('delivering');
  const [incomingCount, setIncomingCount] = useState(0);

  const refresh = async () => {
    setLoading(true);
    try {
      const [ordersRes, historyRes, profileRes] = await Promise.all([
        getDeliveringOrders(),
        getDeliveredHistory(),
        getDriverProfile(),
      ]);

      if (!ordersRes?.success) throw new Error(ordersRes?.message || 'Failed to load orders');
      setOrders(ordersRes.data);

      if (historyRes?.success) {
        setHistory(historyRes.data);
      }

      if (profileRes?.success) {
        setProfile(profileRes.data);
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err?.message || 'Không tải được dữ liệu tài xế');
    } finally {
      setLoading(false);
    }
  };

  const updateLocationFromDevice = async () => {
    const token = await getAuthToken();
    if (!token || !isOnline) return;

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập vị trí bị từ chối', 'Không thể cập nhật vị trí tài xế.');
      return;
    }

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
    });

    await updateDriverLocation({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
  };

  useEffect(() => {
    updateLocationFromDevice()
      .catch(() => undefined)
      .finally(() => refresh());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  useEffect(() => {
    if (!DEV_MOCK_MODE || !isOnline) return;

    const id = setInterval(() => {
      const incoming = injectMockIncomingOrder();
      if (incoming) {
        setIncomingCount((v) => v + 1);
        refresh();
      }
    }, 45000);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        o.order_code.toLowerCase().includes(q) ||
        o.restaurant.name.toLowerCase().includes(q) ||
        o.customer.full_name.toLowerCase().includes(q)
    );
  }, [orders, query]);

  const todayIncome = useMemo(() => {
    const now = new Date();
    return history
      .filter((h) => {
        const d = new Date(h.delivered_at);
        return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, item) => sum + item.payout_amount, 0);
  }, [history]);

  const renderDeliveringTab = () => (
    <FlatList
      data={filteredOrders}
      keyExtractor={(item) => item.order_id.toString()}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.orderCode}>{item.order_code}</Text>
          <Text style={styles.subText}>Nhà hàng: {item.restaurant.name}</Text>
          <Text style={styles.subText}>Khách: {item.customer.full_name}</Text>
          <Text style={styles.subText}>Địa chỉ: {item.customer.delivery_address}</Text>
          <View style={styles.actionButtons}>
            <View style={styles.actionBtn}>
              <Button title="Chi tiết" onPress={() => navigation.navigate('OrderDetail', { orderId: item.order_id })} />
            </View>
            <View style={styles.actionBtn}>
              <Button title="Bản đồ" onPress={() => navigation.navigate('OrderMap', { orderId: item.order_id })} />
            </View>
          </View>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.empty}>Không có đơn phù hợp.</Text>}
      refreshing={loading}
      onRefresh={refresh}
      contentContainerStyle={styles.listContent}
    />
  );

  const renderHistoryTab = () => (
    <FlatList
      data={history}
      keyExtractor={(item) => item.order_id.toString()}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.orderCode}>{item.order_code}</Text>
          <Text style={styles.subText}>Nhà hàng: {item.restaurant_name}</Text>
          <Text style={styles.subText}>Khách: {item.customer_name}</Text>
          <Text style={styles.subText}>Địa chỉ: {item.delivery_address}</Text>
          <Text style={styles.doneText}>Hoàn tất: {new Date(item.delivered_at).toLocaleString('vi-VN')}</Text>
          <Text style={styles.moneyText}>Thu nhập đơn: {formatMoney(item.payout_amount)}</Text>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.empty}>Chưa có lịch sử giao hàng.</Text>}
      refreshing={loading}
      onRefresh={refresh}
      contentContainerStyle={styles.listContent}
    />
  );

  const renderProfileTab = () => (
    <View style={styles.profileCard}>
      <Text style={styles.profileTitle}>{profile?.full_name || 'Tài xế'}</Text>
      <Text style={styles.subText}>Email: {profile?.email || MOCK_DRIVER_ACCOUNT.email}</Text>
      <Text style={styles.subText}>SĐT: {profile?.phone_number || '0900000000'}</Text>
      <Text style={styles.subText}>Phương tiện: {profile?.vehicle_type || 'Xe máy'}</Text>
      <Text style={styles.subText}>Biển số: {profile?.vehicle_plate || '59A3-123.45'}</Text>
      <Text style={styles.subText}>Đánh giá: {profile?.rating?.toFixed(2) || '4.80'} / 5</Text>
      <Text style={styles.subText}>Đơn đã hoàn tất: {profile?.completed_orders ?? history.length}</Text>
      <Text style={styles.subText}>Tham gia: {profile?.joined_at ? new Date(profile.joined_at).toLocaleDateString('vi-VN') : 'N/A'}</Text>

      <View style={styles.profileActions}>
        <Button title="Làm mới hồ sơ" onPress={refresh} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Driver Hub</Text>
          <Text style={styles.subtitle}>Quản lý chuyến giao, thu nhập và hồ sơ</Text>
        </View>
        <Button
          title="Đăng xuất"
          onPress={async () => {
            await clearAuthToken();
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          }}
        />
      </View>

      {DEV_MOCK_MODE ? (
        <View style={styles.mockBanner}>
          <Text style={styles.mockText}>
            Mock mode: {MOCK_DRIVER_ACCOUNT.email}. Dữ liệu đang chạy chế độ mô phỏng đầy đủ.
          </Text>
          {incomingCount > 0 ? (
            <Text style={styles.mockPulse}>+{incomingCount} đơn mới vừa đổ vào hệ thống giả lập.</Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.quickRow}>
        <View style={styles.quickCard}>
          <Text style={styles.quickLabel}>Đơn đang giao</Text>
          <Text style={styles.quickValue}>{orders.length}</Text>
        </View>
        <View style={styles.quickCard}>
          <Text style={styles.quickLabel}>Đơn đã giao</Text>
          <Text style={styles.quickValue}>{history.length}</Text>
        </View>
        <View style={styles.quickCard}>
          <Text style={styles.quickLabel}>Thu nhập hôm nay</Text>
          <Text style={styles.quickValue}>{formatMoney(todayIncome)}</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <View style={styles.onlineWrap}>
          <Text style={styles.onlineText}>{isOnline ? 'Đang trực tuyến' : 'Tạm nghỉ'}</Text>
          <Switch value={isOnline} onValueChange={setIsOnline} />
        </View>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Tìm theo mã đơn/nhà hàng/khách"
          style={styles.searchInput}
        />
      </View>

      <View style={styles.tabRow}>
        <Pressable style={[styles.tabBtn, activeTab === 'delivering' && styles.tabBtnActive]} onPress={() => setActiveTab('delivering')}>
          <Text style={[styles.tabText, activeTab === 'delivering' && styles.tabTextActive]}>Đang giao</Text>
        </Pressable>
        <Pressable style={[styles.tabBtn, activeTab === 'history' && styles.tabBtnActive]} onPress={() => setActiveTab('history')}>
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>Lịch sử</Text>
        </Pressable>
        <Pressable style={[styles.tabBtn, activeTab === 'profile' && styles.tabBtnActive]} onPress={() => setActiveTab('profile')}>
          <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>Hồ sơ</Text>
        </Pressable>
      </View>

      {activeTab === 'delivering' && renderDeliveringTab()}
      {activeTab === 'history' && renderHistoryTab()}
      {activeTab === 'profile' && renderProfileTab()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f7fb' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  mockBanner: {
    marginTop: 10,
    backgroundColor: '#fff7ed',
    borderColor: '#fdba74',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  mockText: { color: '#9a3412', fontSize: 12 },
  mockPulse: { color: '#065f46', marginTop: 4, fontSize: 12, fontWeight: '700' },
  quickRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  quickCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quickLabel: { fontSize: 11, color: '#6b7280' },
  quickValue: { fontSize: 16, fontWeight: '800', marginTop: 4, color: '#111827' },
  actionsRow: { marginTop: 12, gap: 10 },
  onlineWrap: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  onlineText: { fontWeight: '700', color: '#111827' },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    padding: 4,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 6,
  },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 10 },
  tabBtnActive: { backgroundColor: '#fff' },
  tabText: { textAlign: 'center', color: '#6b7280', fontWeight: '700' },
  tabTextActive: { color: '#111827' },
  listContent: { paddingBottom: 20 },
  empty: { marginTop: 24, textAlign: 'center', color: '#6b7280' },
  card: {
    marginTop: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    backgroundColor: '#fff',
    gap: 4,
  },
  actionButtons: { marginTop: 8, flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1 },
  orderCode: { fontSize: 20, fontWeight: '800', marginBottom: 4, color: '#0f172a' },
  subText: { color: '#374151', fontSize: 15 },
  doneText: { color: '#065f46', marginTop: 4, fontWeight: '600' },
  moneyText: { color: '#1d4ed8', marginTop: 2, fontWeight: '700' },
  profileCard: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 6,
  },
  profileTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  profileActions: { marginTop: 8 },
});
