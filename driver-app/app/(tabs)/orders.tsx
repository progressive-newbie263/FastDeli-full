import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import {
  acceptOrder,
  getAvailableOrders,
  getMyOrders,
  markOrderDelivered,
  rejectOrder,
  updateDriverLocation,
} from '../../src/services/driverApi';
import { getCurrentLocation } from '../../src/services/location';
import { AvailableOrder, DriverOrder } from '../../src/types/driver';

const PRIMARY = '#00B14F';

type TabKey = 'available' | 'active' | 'history';

const formatCurrency = (value: number) => `${Math.round(value || 0).toLocaleString('vi-VN')}đ`;
const formatDateTime = (value: string) => new Date(value).toLocaleString('vi-VN');

export default function OrdersScreen() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('available');
  const [availableOrders, setAvailableOrders] = useState<AvailableOrder[]>([]);
  const [activeOrders, setActiveOrders] = useState<DriverOrder[]>([]);
  const [historyOrders, setHistoryOrders] = useState<DriverOrder[]>([]);
  const [actingOrderId, setActingOrderId] = useState<number | null>(null);

  const loadOrders = useCallback(async () => {
    if (!token) {
      return;
    }

    setError(null);
    try {
      const location = await getCurrentLocation();
      await updateDriverLocation(token, location.latitude, location.longitude, location.accuracy);

      const [available, active, history] = await Promise.all([
        getAvailableOrders(token, location.latitude, location.longitude, 30),
        getMyOrders(token, 'active'),
        getMyOrders(token, 'history'),
      ]);

      setAvailableOrders(available);
      setActiveOrders(active);
      setHistoryOrders(history);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách đơn hàng.');
    }
  }, [token]);

  useEffect(() => {
    setLoading(true);
    loadOrders().finally(() => setLoading(false));
  }, [loadOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }, [loadOrders]);

  const runOrderAction = useCallback(
    async (orderId: number, action: 'accept' | 'reject' | 'delivered') => {
      if (!token) {
        return;
      }

      setActingOrderId(orderId);
      setError(null);
      try {
        if (action === 'accept') {
          await acceptOrder(token, orderId);
        } else if (action === 'reject') {
          await rejectOrder(token, orderId);
        } else {
          await markOrderDelivered(token, orderId);
        }
        await loadOrders();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể thực hiện thao tác đơn hàng.');
      } finally {
        setActingOrderId(null);
      }
    },
    [loadOrders, token]
  );

  const data = useMemo(() => {
    if (activeTab === 'available') {
      return availableOrders;
    }
    if (activeTab === 'active') {
      return activeOrders;
    }
    return historyOrders;
  }, [activeTab, availableOrders, activeOrders, historyOrders]);

  const renderAvailableOrder = ({ item }: { item: AvailableOrder }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.orderIdRow}>
          <View style={styles.orderIconBox}>
            <MaterialCommunityIcons name="clipboard-list-outline" size={16} color={PRIMARY} />
          </View>
          <Text style={styles.orderId}>{item.order_code}</Text>
        </View>
        <View style={styles.badge}>
          <MaterialCommunityIcons name="map-marker-radius" size={12} color={PRIMARY} />
          <Text style={styles.badgeText}>{item.distance_km.toFixed(1)} km</Text>
        </View>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.routeRow}>
          <View style={[styles.routeDot, { backgroundColor: PRIMARY }]} />
          <View style={styles.routeTextWrap}>
            <Text style={styles.routeRestaurant}>{item.restaurant_name}</Text>
            <Text style={styles.routeAddress} numberOfLines={1}>{item.restaurant_address}</Text>
          </View>
        </View>
        <View style={styles.routeConnector}>
          <View style={styles.routeLine} />
        </View>
        <View style={styles.routeRow}>
          <View style={[styles.routeDot, { backgroundColor: '#F97316' }]} />
          <View style={styles.routeTextWrap}>
            <Text style={styles.routeCustomerLabel}>Khách hàng</Text>
            <Text style={styles.routeAddress} numberOfLines={1}>{item.delivery_address}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.earningRow}>
          <Text style={styles.earningLabel}>Phí giao hàng</Text>
          <Text style={styles.earningValue}>{formatCurrency(item.delivery_fee)}</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          style={[styles.actionBtn, styles.rejectBtn]}
          onPress={() => runOrderAction(item.order_id, 'reject')}
          disabled={actingOrderId === item.order_id}
        >
          <Text style={styles.rejectBtnText}>Từ chối</Text>
        </Pressable>
        <Pressable
          style={[styles.actionBtn, styles.acceptBtn]}
          onPress={() => runOrderAction(item.order_id, 'accept')}
          disabled={actingOrderId === item.order_id}
        >
          {actingOrderId === item.order_id ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.acceptBtnText}>Nhận đơn</Text>
          )}
        </Pressable>
      </View>
    </View>
  );

  const renderDriverOrder = ({ item }: { item: DriverOrder }) => {
    const isCompleted = item.assignment_status === 'completed';
    const isCancellableState = item.assignment_status === 'cancelled';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.orderIdRow}>
            <View style={styles.orderIconBox}>
              <MaterialCommunityIcons name="clipboard-list-outline" size={16} color={PRIMARY} />
            </View>
            <Text style={styles.orderId}>{item.order_code}</Text>
          </View>
          <View style={styles.badge}>
            <MaterialCommunityIcons name="check-circle" size={12} color={PRIMARY} />
            <Text style={styles.badgeText}>{item.assignment_status}</Text>
          </View>
        </View>

        <View style={styles.routeContainer}>
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: PRIMARY }]} />
            <View style={styles.routeTextWrap}>
              <Text style={styles.routeRestaurant}>{item.restaurant_name}</Text>
              <Text style={styles.routeAddress} numberOfLines={1}>{item.restaurant_address}</Text>
            </View>
          </View>
          <View style={styles.routeConnector}>
            <View style={styles.routeLine} />
          </View>
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: '#F97316' }]} />
            <View style={styles.routeTextWrap}>
              <Text style={styles.routeCustomerLabel}>Khách hàng</Text>
              <Text style={styles.routeAddress} numberOfLines={1}>{item.delivery_address}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.timeRow}>
            <MaterialCommunityIcons name="clock-outline" size={14} color="#90A4AE" />
            <Text style={styles.timeLabel}>{formatDateTime(item.assigned_at)}</Text>
          </View>
          <View style={styles.earningRow}>
            <Text style={styles.earningLabel}>Thu nhập</Text>
            <Text style={styles.earningValue}>{formatCurrency(item.delivery_fee)}</Text>
          </View>
        </View>

        {activeTab === 'active' && item.can_mark_delivered && (
          <Pressable
            style={[styles.actionBtn, styles.acceptBtn, { marginTop: 12 }]}
            onPress={() => runOrderAction(item.order_id, 'delivered')}
            disabled={actingOrderId === item.order_id}
          >
            {actingOrderId === item.order_id ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.acceptBtnText}>Xác nhận đã giao</Text>
            )}
          </Pressable>
        )}

        {activeTab === 'history' && (
          <Text style={[styles.historyTag, isCompleted ? styles.historyTagDone : styles.historyTagCancelled]}>
            {isCompleted ? 'Đã hoàn tất' : isCancellableState ? 'Đã hủy' : item.assignment_status}
          </Text>
        )}
      </View>
    );
  };

  const renderItem = (params: { item: AvailableOrder | DriverOrder }) => {
    if (activeTab === 'available') {
      return renderAvailableOrder(params as { item: AvailableOrder });
    }
    return renderDriverOrder(params as { item: DriverOrder });
  };

  const tabLabel = {
    available: 'Khả dụng',
    active: 'Đang giao',
    history: 'Lịch sử',
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đơn hàng tài xế</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{data.length} đơn</Text>
        </View>
      </View>

      <View style={styles.tabsRow}>
        {(Object.keys(tabLabel) as TabKey[]).map((tabKey) => (
          <Pressable
            key={tabKey}
            style={[styles.tabBtn, activeTab === tabKey && styles.tabBtnActive]}
            onPress={() => setActiveTab(tabKey)}
          >
            <Text style={[styles.tabText, activeTab === tabKey && styles.tabTextActive]}>{tabLabel[tabKey]}</Text>
          </Pressable>
        ))}
      </View>

      {!!error && <Text style={styles.errorText}>{error}</Text>}

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>Đang tải dữ liệu đơn hàng...</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => {
            if (activeTab === 'available') {
              return String((item as AvailableOrder).order_id);
            }
            return String((item as DriverOrder).assignment_id);
          }}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          onRefresh={onRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="clipboard-text-search-outline" size={34} color="#9CA3AF" />
              <Text style={styles.emptyText}>Chưa có dữ liệu cho mục này.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  countBadge: {
    backgroundColor: '#E8F8EF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: PRIMARY,
  },

  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  tabBtnActive: {
    backgroundColor: '#E8F8EF',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: PRIMARY,
  },

  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#E8F8EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F8EF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: {
    color: '#007A37',
    fontSize: 12,
    fontWeight: '700',
  },

  routeContainer: {
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    flexShrink: 0,
  },
  routeTextWrap: { flex: 1 },
  routeRestaurant: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  routeCustomerLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  routeAddress: {
    fontSize: 12,
    color: '#78909C',
    marginTop: 1,
    lineHeight: 16,
  },
  routeConnector: {
    paddingLeft: 4,
    paddingVertical: 4,
  },
  routeLine: {
    width: 2,
    height: 18,
    backgroundColor: '#E2E8F0',
    borderRadius: 1,
    marginLeft: 4,
  },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeLabel: {
    fontSize: 13,
    color: '#90A4AE',
  },
  earningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  earningLabel: {
    fontSize: 13,
    color: '#90A4AE',
  },
  earningValue: {
    fontSize: 16,
    fontWeight: '800',
    color: PRIMARY,
  },
  actionsRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtn: {
    backgroundColor: '#FEE2E2',
  },
  rejectBtnText: {
    color: '#B91C1C',
    fontWeight: '700',
  },
  acceptBtn: {
    backgroundColor: PRIMARY,
  },
  acceptBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  historyTag: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '700',
  },
  historyTagDone: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
  },
  historyTagCancelled: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#64748B',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    color: '#6B7280',
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});