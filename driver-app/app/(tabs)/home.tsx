import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import {
  getDriverProfile,
  getWalletSummary,
  updateDriverLocation,
  updateDriverStatus,
} from '../../src/services/driverApi';
import { getCurrentLocation } from '../../src/services/location';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const PRIMARY = '#00B14F';
const PRIMARY_DARK = '#007A37';

const FALLBACK_REGION: Region = {
  latitude: 21.028511,
  longitude: 105.804817,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

// Chiều cao phần stats + sectionHeader khi expanded (px)
// Chỉnh con số này nếu layout thay đổi
const COLLAPSE_OFFSET = 108;

const formatCurrency = (amount: number) =>
  `${Math.round(amount).toLocaleString('vi-VN')}đ`;

// ── Toggle Switch Component ──
function OnlineToggle({
  value,
  onToggle,
  loading,
}: {
  value: boolean;
  onToggle: () => void;
  loading: boolean;
}) {
  const translateX = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: value ? 1 : 0,
      useNativeDriver: true,
      bounciness: 6,
    }).start();
  }, [value]);

  const thumbTranslate = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  const trackColor = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: ['#dce3ea', PRIMARY],
  });

  return (
    <Pressable
      onPress={onToggle}
      disabled={loading}
      hitSlop={8}
      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
    >
      <Animated.View style={[styles.track, { backgroundColor: trackColor }]}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={value ? '#fff' : PRIMARY}
            style={styles.trackSpinner}
          />
        ) : (
          <Animated.View
            style={[styles.thumb, { transform: [{ translateX: thumbTranslate }] }]}
          />
        )}
      </Animated.View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { token } = useAuth();
  const insets = useSafeAreaInsets();

  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [acceptanceRate, setAcceptanceRate] = useState<number | null>(null);
  const [region, setRegion] = useState<Region>(FALLBACK_REGION);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [statsVisible, setStatsVisible] = useState(true);

  // ── Snap collapse / expand ──
  const snapAnim = useRef(new Animated.Value(0)).current;
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapse = () => {
    const toValue = collapsed ? 0 : 1;
    setCollapsed(c => !c);
    Animated.spring(snapAnim, {
      toValue,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  };

  const cardTranslateY = snapAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, COLLAPSE_OFFSET],
  });

  const loadDashboard = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [profile, wallet] = await Promise.all([
        getDriverProfile(token),
        getWalletSummary(token),
      ]);
      setIsOnline(profile.status === 'online' || profile.status === 'busy');
      setTodayEarnings(wallet.today_earnings || 0);
      setAcceptanceRate(wallet.acceptance_rate_week);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu tài xế.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const syncLocation = useCallback(async () => {
    if (!token) return;
    const current = await getCurrentLocation();
    setLocation({ latitude: current.latitude, longitude: current.longitude });
    setRegion({
      latitude: current.latitude,
      longitude: current.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    });
    await updateDriverLocation(token, current.latitude, current.longitude, current.accuracy);
  }, [token]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);
  useEffect(() => { syncLocation().catch(() => {}); }, [syncLocation]);
  useEffect(() => {
    if (!isOnline) return;
    const timer = setInterval(() => syncLocation().catch(() => {}), 15000);
    return () => clearInterval(timer);
  }, [isOnline, syncLocation]);

  const toggleStatus = async () => {
    if (!token || updatingStatus) return;
    const nextStatus = isOnline ? 'offline' : 'online';
    setUpdatingStatus(true);
    setError(null);
    try {
      const profile = await updateDriverStatus(token, nextStatus);
      setIsOnline(profile.status === 'online' || profile.status === 'busy');
      if (nextStatus === 'online') await syncLocation();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const toggleStats = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setStatsVisible(v => !v);
  };

  const acceptanceText = useMemo(() => {
    if (acceptanceRate === null) return '--';
    return `${acceptanceRate.toFixed(0)}%`;
  }, [acceptanceRate]);

  return (
    <View style={styles.container}>
      {/* MAP */}
      <MapView
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFillObject}
        region={region}
        showsUserLocation
        showsMyLocationButton={false}
        mapPadding={{ top: 120, bottom: 100, left: 0, right: 0 }}
      >
        {location && <Marker coordinate={location} pinColor={PRIMARY} />}
      </MapView>

      {/* OVERLAY */}
      <View pointerEvents="box-none" style={StyleSheet.absoluteFillObject}>

        {/* ── TOP ── */}
        <SafeAreaView edges={['top']} style={styles.topArea}>
          <View style={styles.headerCard}>
            <View style={styles.headerLeft}>
              <View style={styles.brandBadge}>
                <MaterialCommunityIcons name="truck-fast" size={18} color="#fff" />
              </View>
              <View style={styles.headerCopy}>
                <Text style={styles.brandLabel}>FastDeli Driver</Text>
                <Text style={styles.stateTitle} numberOfLines={2}>
                  {isOnline ? 'Sẵn sàng\nnhận đơn' : 'Bạn đang\ntạm nghỉ'}
                </Text>
              </View>
            </View>

            <View style={styles.toggleWrapper}>
              <Text style={[styles.toggleLabel, isOnline ? styles.toggleLabelOn : styles.toggleLabelOff]}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
              <OnlineToggle
                value={isOnline}
                onToggle={toggleStatus}
                loading={updatingStatus || loading}
              />
            </View>
          </View>

          {!!error && <Text style={styles.errorText}>{error}</Text>}
        </SafeAreaView>

        {/* ── BOTTOM (SNAP COLLAPSE) ── */}
        <Animated.View
          style={[
            styles.bottomCard,
            { paddingBottom: 8 + insets.bottom, bottom: 18 + insets.bottom },
            { transform: [{ translateY: cardTranslateY }] },
          ]}
        >
          {/* Handle — bấm để collapse / expand */}
          <Pressable onPress={toggleCollapse} style={styles.handleArea}>
            <View style={styles.handle} />
            <MaterialCommunityIcons
              name={collapsed ? 'chevron-up' : 'chevron-down'}
              size={14}
              color="#b0c0cc"
              style={{ marginTop: 2 }}
            />
          </Pressable>

          {/* Section header with toggle */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tổng quan hôm nay</Text>
            <Pressable
              style={({ pressed }) => [styles.toggleVisBtn, pressed && { opacity: 0.7 }]}
              onPress={toggleStats}
              hitSlop={8}
            >
              <MaterialCommunityIcons
                name={statsVisible ? 'eye-off-outline' : 'eye-outline'}
                size={15}
                color="#8a9fac"
              />
              <Text style={styles.toggleVisBtnText}>
                {statsVisible ? 'Ẩn' : 'Hiện'}
              </Text>
            </Pressable>
          </View>

          {/* Stats — animated show/hide */}
          {statsVisible && (
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <MaterialCommunityIcons name="cash" size={22} color={PRIMARY} />
                <Text style={styles.statValue}>
                  {loading ? '...' : formatCurrency(todayEarnings)}
                </Text>
                <Text style={styles.statLabel}>Thu nhập</Text>
              </View>

              <View style={styles.statBox}>
                <MaterialCommunityIcons name="check-circle-outline" size={22} color={PRIMARY} />
                <Text style={styles.statValue}>
                  {loading ? '...' : acceptanceText}
                </Text>
                <Text style={styles.statLabel}>Tỉ lệ nhận</Text>
              </View>
            </View>
          )}
        </Animated.View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* TOP */
  topArea: {
    paddingHorizontal: 14,
    paddingTop: 4,
    gap: 5,
  },

  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 9,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 },
  headerCopy: { flex: 1, minWidth: 0 },
  brandBadge: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
  },
  brandLabel: { fontSize: 10, color: '#9aabb5', fontWeight: '500' },
  stateTitle: { fontSize: 14, fontWeight: '700', color: '#1a2430', flexShrink: 1, lineHeight: 18 },

  /* Toggle switch */
  toggleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  toggleLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  toggleLabelOn: { color: PRIMARY },
  toggleLabelOff: { color: '#b0c0cc' },

  track: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  trackSpinner: {
    alignSelf: 'center',
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },

  errorText: { fontSize: 12, color: '#e24b4a' },

  /* BOTTOM */
  bottomCard: {
    position: 'absolute',
    left: 14, right: 14,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 6,
  },

  handleArea: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
    gap: 2,
  },
  handle: {
    width: 34, height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#1a2430', marginBottom: 10 },
  toggleVisBtn: {
    marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#f4f7fa',
    paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: 8,
  },
  toggleVisBtnText: { fontSize: 11, fontWeight: '600', color: '#8a9fac' },

  statsRow: { flexDirection: 'row', gap: 6 },
  statBox: {
    flex: 1, alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 8,
    gap: 3,
    backgroundColor: '#f6fbf8',
    borderRadius: 12,
    borderWidth: 1, borderColor: '#e6f3ec',
    marginBottom: 4,
  },
  statValue: { fontSize: 15, fontWeight: '800', color: '#1a2430' },
  statLabel: { fontSize: 10, color: '#9aabb5', fontWeight: '500' },
});