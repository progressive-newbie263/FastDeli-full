import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const PRIMARY = '#00B14F';

const BARS = [
  { day: 'T2', pct: 0.3 },
  { day: 'T3', pct: 0.5 },
  { day: 'T4', pct: 0.8 },
  { day: 'T5', pct: 0.4 },
  { day: 'T6', pct: 0.9, active: true },
  { day: 'T7', pct: 0.1 },
  { day: 'CN', pct: 0 },
];

export default function WalletScreen() {
  const MAX_BAR_HEIGHT = 120;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={22} color="#546E7A" />
        </Pressable> */}

        <Text style={styles.headerTitle}>Ví tiền</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Balance card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceTopRow}>
            <View>
              <Text style={styles.balanceLabel}>Số dư khả dụng</Text>
              <Text style={styles.balanceValue}>150,000đ</Text>
            </View>
            <View style={styles.walletIconWrap}>
              <MaterialCommunityIcons name="wallet-outline" size={28} color="rgba(255,255,255,0.85)" />
            </View>
          </View>

          <View style={styles.balanceDivider} />

          <View style={styles.balanceActions}>
            <View style={styles.actionBtn}>
              <View style={styles.actionIconBg}>
                <MaterialCommunityIcons name="bank-transfer-out" size={22} color={PRIMARY} />
              </View>
              <Text style={styles.actionText}>Rút tiền</Text>
            </View>
            <View style={styles.actionDivider} />
            <View style={styles.actionBtn}>
              <View style={styles.actionIconBg}>
                <MaterialCommunityIcons name="history" size={22} color={PRIMARY} />
              </View>
              <Text style={styles.actionText}>Lịch sử</Text>
            </View>
          </View>
        </View>

        {/* Weekly earnings */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Thu nhập tuần này</Text>
          <Text style={styles.sectionSubTitle}>12 - 18 Tháng 4</Text>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.barsArea}>
            {BARS.map((bar) => (
              <View key={bar.day} style={styles.barCol}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: bar.pct * MAX_BAR_HEIGHT,
                        backgroundColor: bar.active ? PRIMARY : '#D9E8F0',
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barLabel, bar.active && styles.barLabelActive]}>
                  {bar.day}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.peakRow}>
            <View style={styles.peakDot} />
            <Text style={styles.peakText}>Thứ 6 là ngày cao nhất tuần này</Text>
          </View>
        </View>

        {/* Quick stats */}
        <View style={styles.quickStatsRow}>
          <View style={[styles.quickStat, { marginRight: 10 }]}>
            <MaterialCommunityIcons name="trending-up" size={20} color={PRIMARY} />
            <Text style={styles.quickStatValue}>245,000đ</Text>
            <Text style={styles.quickStatLabel}>Tổng tuần</Text>
          </View>
          <View style={styles.quickStat}>
            <MaterialCommunityIcons name="truck-fast-outline" size={20} color={PRIMARY} />
            <Text style={styles.quickStatValue}>12 đơn</Text>
            <Text style={styles.quickStatLabel}>Đã giao</Text>
          </View>
        </View>

      </ScrollView>
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
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },

  balanceCard: {
    backgroundColor: PRIMARY,
    borderRadius: 20,
    padding: 22,
    marginBottom: 24,
    shadowColor: PRIMARY,
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  balanceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    marginBottom: 6,
  },
  balanceValue: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  walletIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 18,
  },
  balanceActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionBtn: {
    alignItems: 'center',
    flex: 1,
  },
  actionDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  actionIconBg: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  sectionSubTitle: {
    fontSize: 13,
    color: '#90A4AE',
  },

  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  barsArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    paddingBottom: 24,
    marginBottom: 14,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    width: 12,
    height: 120,
    justifyContent: 'flex-end',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  barLabel: {
    position: 'absolute',
    bottom: -20,
    fontSize: 11,
    color: '#90A4AE',
    fontWeight: '500',
  },
  barLabelActive: {
    color: PRIMARY,
    fontWeight: '800',
  },
  peakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  peakDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PRIMARY,
  },
  peakText: {
    fontSize: 12,
    color: '#78909C',
  },

  quickStatsRow: {
    flexDirection: 'row',
  },
  quickStat: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F7',
    gap: 4,
  },
  quickStatValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1A1A',
    marginTop: 2,
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#90A4AE',
  },
});