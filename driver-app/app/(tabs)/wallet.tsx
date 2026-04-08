import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { getWalletSummary } from '../../src/services/driverApi';
import { WalletSummary } from '../../src/types/driver';

const PRIMARY = '#00B14F';

const EMPTY_SUMMARY: WalletSummary = {
  available_balance: 0,
  today_earnings: 0,
  week_earnings: 0,
  month_earnings: 0,
  completed_orders_week: 0,
  accepted_count_week: 0,
  rejected_count_week: 0,
  acceptance_rate_week: null,
  daily_breakdown: [],
};

const formatCurrency = (value: number) => `${Math.round(value || 0).toLocaleString('vi-VN')}đ`;
const weekDayLabel = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDay();
  const labels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return labels[day] || 'N/A';
};

export default function WalletScreen() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<WalletSummary>(EMPTY_SUMMARY);
  const [error, setError] = useState<string | null>(null);

  const MAX_BAR_HEIGHT = 120;

  useEffect(() => {
    const fetchWallet = async () => {
      if (!token) {
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const walletData = await getWalletSummary(token);
        setSummary(walletData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu ví tài xế.');
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, [token]);

  const bars = useMemo(() => {
    const points = summary.daily_breakdown || [];
    const max = points.reduce((acc, point) => Math.max(acc, point.amount), 0);

    return points.map((point) => {
      const pct = max > 0 ? point.amount / max : 0;
      return {
        day: weekDayLabel(point.day),
        pct,
        amount: point.amount,
        active: point.amount === max && max > 0,
      };
    });
  }, [summary.daily_breakdown]);

  const bestDayText = useMemo(() => {
    if (!bars.length) {
      return 'Chưa có dữ liệu thu nhập tuần này';
    }

    const best = bars.reduce((acc, bar) => (bar.amount > acc.amount ? bar : acc), bars[0]);
    if (best.amount <= 0) {
      return 'Chưa có dữ liệu thu nhập tuần này';
    }

    return `${best.day} là ngày thu nhập cao nhất tuần này`;
  }, [bars]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ví tiền</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!!error && <Text style={styles.errorText}>{error}</Text>}
        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={PRIMARY} />
            <Text style={styles.loadingText}>Đang tải dữ liệu ví...</Text>
          </View>
        )}

        <View style={styles.balanceCard}>
          <View style={styles.balanceTopRow}>
            <View>
              <Text style={styles.balanceLabel}>Số dư khả dụng</Text>
              <Text style={styles.balanceValue}>{formatCurrency(summary.available_balance)}</Text>
            </View>
            <View style={styles.walletIconWrap}>
              <MaterialCommunityIcons name="wallet-outline" size={28} color="rgba(255,255,255,0.85)" />
            </View>
          </View>

          <View style={styles.balanceDivider} />

          <View style={styles.balanceActions}>
            <View style={styles.actionBtn}>
              <View style={styles.actionIconBg}>
                <MaterialCommunityIcons name="cash-fast" size={22} color={PRIMARY} />
              </View>
              <Text style={styles.actionText}>Hôm nay: {formatCurrency(summary.today_earnings)}</Text>
            </View>
            <View style={styles.actionDivider} />
            <View style={styles.actionBtn}>
              <View style={styles.actionIconBg}>
                <MaterialCommunityIcons name="calendar-month" size={22} color={PRIMARY} />
              </View>
              <Text style={styles.actionText}>Tháng: {formatCurrency(summary.month_earnings)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Thu nhập tuần này</Text>
          <Text style={styles.sectionSubTitle}>{formatCurrency(summary.week_earnings)}</Text>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.barsArea}>
            {bars.map((bar) => (
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
            <Text style={styles.peakText}>{bestDayText}</Text>
          </View>
        </View>

        <View style={styles.quickStatsRow}>
          <View style={[styles.quickStat, { marginRight: 10 }]}>
            <MaterialCommunityIcons name="trending-up" size={20} color={PRIMARY} />
            <Text style={styles.quickStatValue}>{formatCurrency(summary.week_earnings)}</Text>
            <Text style={styles.quickStatLabel}>Tổng tuần</Text>
          </View>
          <View style={styles.quickStat}>
            <MaterialCommunityIcons name="truck-fast-outline" size={20} color={PRIMARY} />
            <Text style={styles.quickStatValue}>{summary.completed_orders_week} đơn</Text>
            <Text style={styles.quickStatLabel}>Đã giao</Text>
          </View>
        </View>

        <View style={[styles.quickStat, { marginTop: 12 }]}> 
          <MaterialCommunityIcons name="percent-box-outline" size={20} color={PRIMARY} />
          <Text style={styles.quickStatValue}>
            {summary.acceptance_rate_week === null ? '--' : `${summary.acceptance_rate_week.toFixed(0)}%`}
          </Text>
          <Text style={styles.quickStatLabel}>Tỉ lệ nhận đơn tuần</Text>
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
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 4,
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
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 12,
  },
  errorText: {
    marginBottom: 10,
    color: '#B91C1C',
    fontSize: 12,
  },
});