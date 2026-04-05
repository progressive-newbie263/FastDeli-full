import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function WalletScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ví tiền</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Số dư khả dụng</Text>
          <Text style={styles.balanceValue}>150,000đ</Text>
          
          <View style={styles.balanceActions}>
            <View style={styles.actionBtn}>
              <View style={styles.actionIconContainer}>
                <MaterialCommunityIcons name="bank-transfer-out" size={24} color="#00B14F" />
              </View>
              <Text style={styles.actionText}>Rút tiền</Text>
            </View>
            <View style={styles.actionBtn}>
              <View style={styles.actionIconContainer}>
                <MaterialCommunityIcons name="history" size={24} color="#00B14F" />
              </View>
              <Text style={styles.actionText}>Lịch sử</Text>
            </View>
          </View>
        </View>

        {/* Weekly Stats */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Thu nhập tuần này</Text>
          <Text style={styles.sectionSubTitle}>12 Tháng 4 - 18 Tháng 4</Text>
        </View>

        <View style={styles.chartContainer}>
          <View style={styles.barsArea}>
            <View style={styles.barItem}><View style={[styles.barFill, { height: '30%' }]} /><Text style={styles.barDay}>T2</Text></View>
            <View style={styles.barItem}><View style={[styles.barFill, { height: '50%' }]} /><Text style={styles.barDay}>T3</Text></View>
            <View style={styles.barItem}><View style={[styles.barFill, { height: '80%' }]} /><Text style={styles.barDay}>T4</Text></View>
            <View style={styles.barItem}><View style={[styles.barFill, { height: '40%' }]} /><Text style={styles.barDay}>T5</Text></View>
            <View style={styles.barItem}><View style={[styles.barFill, { height: '90%', backgroundColor: '#00B14F' }]} /><Text style={styles.barDayActive}>T6</Text></View>
            <View style={styles.barItem}><View style={[styles.barFill, { height: '10%' }]} /><Text style={styles.barDay}>T7</Text></View>
            <View style={styles.barItem}><View style={[styles.barFill, { height: '0%' }]} /><Text style={styles.barDay}>CN</Text></View>
          </View>
        </View>
      </ScrollView>
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  content: {
    padding: 16,
  },
  balanceCard: {
    backgroundColor: '#00B14F',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#00B14F',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  balanceLabel: {
    color: '#dcfce7',
    fontSize: 16,
  },
  balanceValue: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 24,
  },
  balanceActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 16,
  },
  actionBtn: {
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionSubTitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    height: 220,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  barsArea: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 24,
  },
  barItem: {
    alignItems: 'center',
    width: 32,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: 14,
    backgroundColor: '#cbd5e1',
    borderRadius: 8,
  },
  barDay: {
    position: 'absolute',
    bottom: -24,
    fontSize: 12,
    color: '#64748b',
  },
  barDayActive: {
    position: 'absolute',
    bottom: -24,
    fontSize: 12,
    color: '#0f172a',
    fontWeight: '700',
  },
});
