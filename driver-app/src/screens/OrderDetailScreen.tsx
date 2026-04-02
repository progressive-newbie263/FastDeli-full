import React, { useMemo, useState } from 'react';
import { Alert, Button, Linking, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { confirmDelivered, getOrderMap } from '../api/driverApi';
import type { OrderMapDTO } from '../domain/driverDto';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;

function formatKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return (2 * R * Math.asin(Math.sqrt(h))).toFixed(2);
}

export default function OrderDetailScreen({ route, navigation }: Props) {
  const { orderId } = route.params;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OrderMapDTO | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getOrderMap(orderId);
      if (!res?.success) throw new Error(res?.message || 'Không tải được chi tiết đơn');
      setData(res.data);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.message || 'Không tải được chi tiết đơn');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const routeDistanceKm = useMemo(() => {
    if (!data?.customer?.latitude || !data?.customer?.longitude) return null;
    return formatKm(
      Number(data.restaurant.latitude),
      Number(data.restaurant.longitude),
      Number(data.customer.latitude),
      Number(data.customer.longitude)
    );
  }, [data]);

  const openExternalMap = async () => {
    if (!data) return;

    const lat = data.customer?.latitude ?? data.restaurant.latitude;
    const lng = data.customer?.longitude ?? data.restaurant.longitude;

    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    const can = await Linking.canOpenURL(url);
    if (!can) {
      Alert.alert('Không thể mở bản đồ', 'Thiết bị không hỗ trợ mở URL bản đồ.');
      return;
    }
    await Linking.openURL(url);
  };

  const callCustomer = async () => {
    if (!data?.customer?.phone_number) {
      Alert.alert('Thiếu số điện thoại', 'Đơn này chưa có số điện thoại khách hàng trong dữ liệu mock.');
      return;
    }

    const telUrl = `tel:${data.customer.phone_number}`;
    const can = await Linking.canOpenURL(telUrl);
    if (!can) {
      Alert.alert('Không gọi được', 'Thiết bị không hỗ trợ chức năng gọi điện.');
      return;
    }
    await Linking.openURL(telUrl);
  };

  const onConfirmDelivered = async () => {
    try {
      const res = await confirmDelivered(orderId);
      if (!res?.success) throw new Error(res?.message || 'Xác nhận thất bại');
      Alert.alert('Hoàn tất', 'Đơn đã hoàn tất giao thành công.');
      navigation.reset({ index: 0, routes: [{ name: 'Orders' }] });
    } catch (err: any) {
      Alert.alert('Lỗi', err?.message || 'Không thể xác nhận đơn');
    }
  };

  if (loading || !data) {
    return (
      <View style={styles.center}>
        <Text>Đang tải chi tiết đơn...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.code}>{data.order_code}</Text>
        <Text style={styles.label}>Trạng thái: {data.order_status}</Text>
        <Text style={styles.label}>Nhà hàng: {data.restaurant.name}</Text>
        <Text style={styles.label}>Khách: {data.customer.full_name}</Text>
        <Text style={styles.label}>SĐT khách: {data.customer.phone_number || 'Chưa có'}</Text>
        <Text style={styles.label}>Địa chỉ giao: {data.customer.delivery_address}</Text>
        {routeDistanceKm ? <Text style={styles.distance}>Khoảng cách ước tính: {routeDistanceKm} km</Text> : null}
        {data.customer.note ? <Text style={styles.note}>Ghi chú: {data.customer.note}</Text> : null}
      </View>

      <View style={styles.actions}>
        <View style={styles.actionBtn}>
          <Button title="Mở chỉ đường" onPress={openExternalMap} />
        </View>
        <View style={styles.actionBtn}>
          <Button title="Gọi khách" onPress={callCustomer} />
        </View>
      </View>

      <View style={styles.actions}>
        <View style={styles.actionBtn}>
          <Button title="Xem bản đồ trong app" onPress={() => navigation.navigate('OrderMap', { orderId })} />
        </View>
      </View>

      <View style={styles.footer}>
        <Button title="Xác nhận giao xong" onPress={onConfirmDelivered} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fb', padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    gap: 6,
  },
  code: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  label: { fontSize: 15, color: '#334155' },
  distance: { marginTop: 4, color: '#1d4ed8', fontWeight: '700' },
  note: { marginTop: 4, color: '#92400e', backgroundColor: '#fffbeb', padding: 8, borderRadius: 8 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: { flex: 1 },
  footer: { marginTop: 16 },
});
