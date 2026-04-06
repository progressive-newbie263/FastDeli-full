import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { APP_COLORS } from '../../src/constants/theme';

const PRIMARY = '#00B14F';
const PRIMARY_DARK = '#007A37';

export default function HomeScreen() {
  const [isOnline, setIsOnline] = useState(false);

  const initialRegion = {
    latitude: 21.028511,
    longitude: 105.804817,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const toggleStatus = () => setIsOnline((prev) => !prev);

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFillObject}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        <Marker coordinate={{ latitude: 21.028511, longitude: 105.804817 }} pinColor={PRIMARY} />
      </MapView>

      {/* Top overlay – SafeAreaView giữ padding top tự nhiên, thêm paddingTop nhỏ */}
      <SafeAreaView edges={['top']} style={styles.topArea}>
        <View style={styles.headerCard}>
          <View style={styles.headerLeft}>
            <View style={styles.brandBadge}>
              <MaterialCommunityIcons name="truck-fast" size={14} color="#fff" />
            </View>
            <View>
              <Text style={styles.brandLabel}>FastDeli Driver</Text>
              <Text style={styles.stateTitle}>
                {isOnline ? 'Sẵn sàng nhận đơn' : 'Bạn đang tạm nghỉ'}
              </Text>
            </View>
          </View>

          <View style={[styles.statusPill, isOnline ? styles.pillOn : styles.pillOff]}>
            <View style={[styles.statusDot, isOnline ? styles.dotOn : styles.dotOff]} />
            <Text style={[styles.statusPillText, isOnline ? styles.pillTextOn : styles.pillTextOff]}>
              {isOnline ? 'Trực tuyến' : 'Ngoại tuyến'}
            </Text>
          </View>
        </View>

        <Text style={styles.stateSubTitle}>
          {isOnline
            ? 'Hệ thống đang tự động ghép đơn hàng gần bạn.'
            : 'Bật trực tuyến để bắt đầu chuyến giao hàng.'}
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.powerButton,
            isOnline ? styles.powerBtnOn : styles.powerBtnOff,
            pressed && { opacity: 0.88 },
          ]}
          onPress={toggleStatus}
        >
          <View style={styles.powerIconWrap}>
            <MaterialCommunityIcons
              name={isOnline ? 'power-plug-off' : 'power'}
              size={20}
              color={isOnline ? PRIMARY_DARK : '#fff'}
            />
          </View>
          <Text style={[styles.powerButtonText, isOnline && styles.powerButtonTextOn]}>
            {isOnline ? 'Tắt trực tuyến' : 'Bật trực tuyến'}
          </Text>
        </Pressable>
      </SafeAreaView>

      {/* Bottom card */}
      <View style={styles.bottomCard}>
        <View style={styles.bottomCardHandle} />
        <Text style={styles.sectionTitle}>Tổng quan hôm nay</Text>

        <View style={styles.statsRow}>
          <View style={[styles.statBox, { marginRight: 8 }]}>
            <MaterialCommunityIcons name="cash" size={22} color={PRIMARY} style={styles.statIcon} />
            <Text style={styles.statValue}>0đ</Text>
            <Text style={styles.statLabel}>Thu nhập</Text>
          </View>
          <View style={styles.statBox}>
            <MaterialCommunityIcons name="check-circle-outline" size={22} color={PRIMARY} style={styles.statIcon} />
            <Text style={styles.statValue}>100%</Text>
            <Text style={styles.statLabel}>Tỉ lệ nhận đơn</Text>
          </View>
        </View>

        <View style={[styles.noteCard, isOnline && styles.noteCardOn]}>
          <MaterialCommunityIcons
            name={isOnline ? 'check-decagram-outline' : 'sleep'}
            size={20}
            color={isOnline ? PRIMARY : '#90A4AE'}
          />
          <Text style={styles.noteText}>
            {isOnline
              ? 'Bạn đang ở trạng thái nhận đơn. Hãy kiểm tra thông báo liên tục.'
              : 'Chế độ nghỉ đang bật. Bạn sẽ không nhận đơn mới cho đến khi trực tuyến.'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },

  topArea: {
    paddingHorizontal: 16,
    paddingTop: 16,   // thêm 16px xuống để tránh lỗi hiển thị sát mép
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLabel: {
    fontSize: 11,
    color: '#90A4AE',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  stateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 5,
  },
  pillOn: { backgroundColor: '#E8F8EF' },
  pillOff: { backgroundColor: '#F1F5F9' },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  dotOn: { backgroundColor: PRIMARY },
  dotOff: { backgroundColor: '#CBD5E0' },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  pillTextOn: { color: PRIMARY_DARK },
  pillTextOff: { color: '#90A4AE' },

  stateSubTitle: {
    fontSize: 13,
    color: '#78909C',
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 4,
    lineHeight: 18,
  },

  powerButton: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  powerBtnOff: {
    backgroundColor: PRIMARY,
    shadowColor: PRIMARY,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  powerBtnOn: {
    backgroundColor: '#E8F8EF',
    borderWidth: 1.5,
    borderColor: '#A7F3C4',
  },
  powerIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  powerButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  powerButtonTextOn: {
    color: PRIMARY_DARK,
  },

  bottomCard: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  bottomCardHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F7FBF8',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCEEE4',
  },
  statIcon: { marginBottom: 4 },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  statLabel: {
    fontSize: 12,
    color: '#90A4AE',
    marginTop: 2,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  noteCardOn: {
    backgroundColor: '#F0FBF4',
    borderColor: '#C6EDD5',
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#78909C',
    lineHeight: 18,
  },
});