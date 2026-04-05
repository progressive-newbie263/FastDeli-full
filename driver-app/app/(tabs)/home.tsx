import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [isOnline, setIsOnline] = useState(false);

  // Mock initial region for Map
  const initialRegion = {
    latitude: 21.028511,  // Hanoi
    longitude: 105.804817,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const toggleStatus = () => {
    setIsOnline(!isOnline);
  };

  return (
    <View style={styles.container}>
      {/* Map Background */}
      <MapView
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFillObject}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        <Marker coordinate={{ latitude: 21.028511, longitude: 105.804817 }} />
      </MapView>

      {/* Online/Offline Toggle Header */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.statusCard}>
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusLabel}>
              {isOnline ? 'Bạn đang Trực tuyến' : 'Bạn đang Ngoại tuyến'}
            </Text>
            <Text style={styles.statusSub}>
              {isOnline ? 'Đang tự động nhận đơn hàng mới' : 'Bật trực tuyến để nhận đơn ngay'}
            </Text>
          </View>
          <Pressable
            style={[styles.toggleButton, isOnline ? styles.toggleOn : styles.toggleOff]}
            onPress={toggleStatus}
          >
            <MaterialCommunityIcons name="power" size={28} color="#fff" />
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Driver Dashboard Bottom Card */}
      <View style={styles.bottomCard}>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>0đ</Text>
            <Text style={styles.statLabel}>Thu nhập hôm nay</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>100%</Text>
            <Text style={styles.statLabel}>Tỉ lệ nhận đơn</Text>
          </View>
        </View>

        {!isOnline && (
          <View style={styles.offlineOverlay}>
            <MaterialCommunityIcons name="sleep" size={40} color="#94a3b8" />
            <Text style={styles.offlineText}>Hãy bật Trực tuyến để bắt đầu làm việc</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  statusTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  statusSub: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  toggleButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  toggleOn: {
    backgroundColor: '#00B14F',
  },
  toggleOff: {
    backgroundColor: '#ef4444',
  },
  bottomCard: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 5,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#e2e8f0',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#00B14F',
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  offlineOverlay: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    alignItems: 'center',
  },
  offlineText: {
    marginTop: 8,
    color: '#64748b',
    fontWeight: '500',
  },
});
