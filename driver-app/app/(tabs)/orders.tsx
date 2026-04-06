import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';

const PRIMARY = '#00B14F';

const mockOrders = [
  {
    id: 'ORD-12001',
    restaurant: 'Phở Tuấn',
    address: '123 Đường Điện Biên Phủ, Ba Đình, Hà Nội',
    customerAddress: 'Toà nhà Lotte, 54 Liễu Giai, Ba Đình',
    price: '30,000đ',
    timestamp: '10:30',
    status: 'completed',
  },
  {
    id: 'ORD-12002',
    restaurant: 'Bánh Mì Hội An',
    address: '45 Hàng Bài, Hoàn Kiếm, Hà Nội',
    customerAddress: 'Tầng 12, Toà ACB, 10 Phan Chu Trinh',
    price: '15,000đ',
    timestamp: '11:15',
    status: 'completed',
  },
];

export default function OrdersScreen() {
  const renderItem = ({ item }: { item: typeof mockOrders[0] }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.orderIdRow}>
          <View style={styles.orderIconBox}>
            <MaterialCommunityIcons name="clipboard-list-outline" size={16} color={PRIMARY} />
          </View>
          <Text style={styles.orderId}>{item.id}</Text>
        </View>
        <View style={styles.badge}>
          <MaterialCommunityIcons name="check-circle" size={12} color={PRIMARY} />
          <Text style={styles.badgeText}>Hoàn thành</Text>
        </View>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.routeRow}>
          <View style={[styles.routeDot, { backgroundColor: PRIMARY }]} />
          <View style={styles.routeTextWrap}>
            <Text style={styles.routeRestaurant}>{item.restaurant}</Text>
            <Text style={styles.routeAddress} numberOfLines={1}>{item.address}</Text>
          </View>
        </View>
        <View style={styles.routeConnector}>
          <View style={styles.routeLine} />
        </View>
        <View style={styles.routeRow}>
          <View style={[styles.routeDot, { backgroundColor: '#F97316' }]} />
          <View style={styles.routeTextWrap}>
            <Text style={styles.routeCustomerLabel}>Khách hàng</Text>
            <Text style={styles.routeAddress} numberOfLines={1}>{item.customerAddress}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.timeRow}>
          <MaterialCommunityIcons name="clock-outline" size={14} color="#90A4AE" />
          <Text style={styles.timeLabel}>{item.timestamp}</Text>
        </View>
        <View style={styles.earningRow}>
          <Text style={styles.earningLabel}>Thu nhập</Text>
          <Text style={styles.earningValue}>{item.price}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch sử đơn hàng</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{mockOrders.length} đơn</Text>
        </View>
      </View>

      <FlatList
        data={mockOrders}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
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
});