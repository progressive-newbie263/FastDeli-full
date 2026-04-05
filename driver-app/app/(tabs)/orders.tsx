import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';

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
        <Text style={styles.orderId}>{item.id}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Hoàn thành</Text>
        </View>
      </View>

      <View style={styles.locationContainer}>
        <View style={styles.locationRow}>
          <MaterialCommunityIcons name="store-marker-outline" size={20} color="#00B14F" />
          <Text style={styles.locationText} numberOfLines={1}>{item.restaurant} - {item.address}</Text>
        </View>
        <View style={styles.dashLine} />
        <View style={styles.locationRow}>
          <MaterialCommunityIcons name="map-marker" size={20} color="#f97316" />
          <Text style={styles.locationText} numberOfLines={1}>{item.customerAddress}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.timeLabel}>{item.timestamp}</Text>
        <Text style={styles.priceLabel}>Thu nhập: <Text style={styles.priceValue}>{item.price}</Text></Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch sử Đơn hàng</Text>
      </View>
      <FlatList
        data={mockOrders}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  badge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '600',
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#475569',
    flex: 1,
  },
  dashLine: {
    height: 16,
    width: 2,
    backgroundColor: '#cbd5e1',
    marginLeft: 9,
    marginVertical: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  timeLabel: {
    color: '#64748b',
    fontSize: 13,
  },
  priceLabel: {
    color: '#64748b',
    fontSize: 14,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
});
