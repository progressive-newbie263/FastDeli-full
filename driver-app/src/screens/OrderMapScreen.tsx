import React, { useMemo, useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { confirmDelivered, getOrderMap } from '../api/driverApi';
import { DEV_MOCK_MODE } from '../config/api';
import type { OrderMapDTO, VirtualCandidateDTO } from '../domain/driverDto';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderMap'>;

export default function OrderMapScreen({ route, navigation }: Props) {
  const { orderId } = route.params;
  const [loading, setLoading] = useState(true);
  const [mapData, setMapData] = useState<OrderMapDTO | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getOrderMap(orderId);
      if (!res?.success) throw new Error(res?.message || 'Failed to load map');
      setMapData(res.data);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.message || 'Không tải được bản đồ');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const selectedCandidate = useMemo(() => {
    if (!mapData) return null;
    const idx = mapData.selected_virtual_candidate_idx;
    const match = (mapData.virtual_candidates || []).find((c: VirtualCandidateDTO) => c.candidate_idx === idx);
    return match || null;
  }, [mapData]);

  const initialRegion = useMemo(() => {
    if (!mapData) return null;
    const lat = Number(mapData.restaurant.latitude);
    const lng = Number(mapData.restaurant.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return {
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }, [mapData]);

  const canDrawPolyline =
    !!mapData && !!selectedCandidate && Number.isFinite(mapData.restaurant.latitude) && Number.isFinite(mapData.restaurant.longitude);

  const onConfirmDelivered = async () => {
    try {
      const res = await confirmDelivered(orderId);
      if (!res?.success) throw new Error(res?.message || 'Confirm failed');
      Alert.alert('Hoàn tất', 'Đơn đã được chuyển sang delivered.');
      navigation.navigate('Orders');
    } catch (err: any) {
      Alert.alert('Không thể xác nhận', err?.message || 'Bạn không có quyền xác nhận đơn này.');
    }
  };

  if (loading || !mapData) {
    return (
      <View style={styles.center}>
        <Text>Đang tải bản đồ...</Text>
      </View>
    );
  }

  if (!initialRegion) {
    return (
      <View style={styles.center}>
        <Text>Thiếu dữ liệu tọa độ để hiển thị bản đồ.</Text>
        <View style={styles.retryBtn}>
          <Button title="Tải lại" onPress={load} />
        </View>
      </View>
    );
  }

  const customerLat = mapData.customer?.latitude;
  const customerLng = mapData.customer?.longitude;

  return (
    <View style={styles.container}>
      {DEV_MOCK_MODE ? (
        <View style={styles.mockMapWrap}>
          <Text style={styles.mockMapTitle}>Lộ trình giao hàng (Mock)</Text>
          <Text style={styles.mockRow}>Nhà hàng: {mapData.restaurant.name}</Text>
          <Text style={styles.mockRow}>
            Tọa độ quán: {Number(mapData.restaurant.latitude).toFixed(5)}, {Number(mapData.restaurant.longitude).toFixed(5)}
          </Text>
          <Text style={styles.mockRow}>Khách: {mapData.customer.full_name}</Text>
          <Text style={styles.mockRow}>Địa chỉ: {mapData.customer.delivery_address}</Text>
          {Number.isFinite(customerLat) && Number.isFinite(customerLng) ? (
            <Text style={styles.mockRow}>
              Tọa độ khách: {Number(customerLat).toFixed(5)}, {Number(customerLng).toFixed(5)}
            </Text>
          ) : null}
          <Text style={styles.mockHint}>Chế độ mock: tạm ẩn bản đồ thật để tránh lỗi thiết bị/network khi demo.</Text>
        </View>
      ) : (
        <MapView style={styles.map} initialRegion={initialRegion} mapType="standard">
          <Marker
            coordinate={{ latitude: mapData.restaurant.latitude, longitude: mapData.restaurant.longitude }}
            pinColor="red"
            title="Nhà hàng"
          />

          {typeof customerLat === 'number' && typeof customerLng === 'number' ? (
            <Marker
              coordinate={{ latitude: customerLat, longitude: customerLng }}
              pinColor="blue"
              title="Khách hàng"
            />
          ) : null}

          {(mapData.virtual_candidates || []).map((c: VirtualCandidateDTO) => (
            <Marker
              key={c.candidate_idx}
              coordinate={{ latitude: c.latitude, longitude: c.longitude }}
              pinColor="yellow"
            />
          ))}

          {canDrawPolyline ? (
            <Polyline
              coordinates={[
                { latitude: selectedCandidate.latitude, longitude: selectedCandidate.longitude },
                { latitude: mapData.restaurant.latitude, longitude: mapData.restaurant.longitude },
              ]}
              strokeWidth={3}
              strokeColor="orange"
            />
          ) : null}
        </MapView>
      )}

      <View style={styles.bottomBar}>
        <Text style={styles.orderCode}>{mapData.order_code}</Text>
        <View style={styles.bottomAction}>
          <Button title="Chi tiết đơn" onPress={() => navigation.navigate('OrderDetail', { orderId })} />
        </View>
        <Button title="Xác nhận giao xong" onPress={onConfirmDelivered} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { flex: 1 },
  mockMapWrap: { flex: 1, padding: 16, gap: 8, backgroundColor: '#f8fafc' },
  mockMapTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 6 },
  mockRow: { fontSize: 15, color: '#334155' },
  mockHint: { marginTop: 8, color: '#92400e', backgroundColor: '#fffbeb', padding: 10, borderRadius: 8 },
  bottomBar: { padding: 12, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#fff' },
  orderCode: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  bottomAction: { marginBottom: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  retryBtn: { marginTop: 12 },
});
