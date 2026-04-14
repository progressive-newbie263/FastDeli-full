'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Building2,
  CalendarDays,
  Coins,
  HandCoins,
  Percent,
  ReceiptText,
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/layout/AdminLayout';
import { formatCurrency } from '@/lib/utils';
import { adminAPI } from '@/app/utils/api';
import type { AdminLedgerResponse } from '@/app/types/admin';

const DAY_OPTIONS = [7, 14, 30] as const;

type DayOption = (typeof DAY_OPTIONS)[number];

export default function AdminLedgerPage() {
  const [days, setDays] = useState<DayOption>(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<AdminLedgerResponse['data'] | null>(null);

  const fetchLedger = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = (await adminAPI.getDebtLedger(days)) as AdminLedgerResponse;
      if (!response?.success || !response?.data) {
        throw new Error('Không tải được bảng công nợ');
      }
      setPayload(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu bảng công nợ.');
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  const summaryCards = useMemo(() => {
    const summary = payload?.summary;
    const commissionRate = Number(payload?.commission_rate || 0);

    return [
      {
        key: 'gross',
        title: 'Thu nhập thực hệ thống',
        value: formatCurrency(Number(summary?.gross_revenue || 0)),
        note: `Tổng thu từ khách hàng (${days} ngày)`,
        icon: <HandCoins size={20} />,
        className: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
      },
      {
        key: 'restaurant',
        title: 'Thu nhập ròng của nhà hàng',
        value: formatCurrency(Number(summary?.restaurant_net_revenue || 0)),
        note: 'Doanh thu sau khi trừ chiết khấu',
        icon: <Building2 size={20} />,
        className: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
      },
      {
        key: 'commission',
        title: 'Admin nhận chiết khấu',
        value: formatCurrency(Number(summary?.platform_commission_revenue || 0)),
        note: `Tỷ lệ hiện tại: ${(commissionRate * 100).toFixed(1)}%`,
        icon: <Percent size={20} />,
        className: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
      },
      {
        key: 'orders',
        title: 'Tổng đơn đã đối soát',
        value: Number(summary?.total_orders || 0).toLocaleString('vi-VN'),
        note: 'Đơn thanh toán hợp lệ, không tính đã hủy',
        icon: <ReceiptText size={20} />,
        className: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20',
      },
    ];
  }, [days, payload]);

  return (
    <ProtectedRoute>
      <AdminLayout title="Bảng công nợ" subtitle="Số thu chi hệ thống theo ngày">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
            <CalendarDays size={16} />
            Cập nhật bảng thu nhập thực và thu nhập ròng của toàn hệ thống.
          </div>

          <div className="flex items-center gap-2">
            {DAY_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => setDays(option)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  days === option
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60'
                }`}
              >
                {option} ngày
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-10 text-center border border-gray-100 dark:border-gray-700">
            <div className="animate-spin h-10 w-10 mx-auto rounded-full border-4 border-primary-200 border-t-primary-600" />
            <p className="mt-4 text-gray-600 dark:text-gray-300">Đang tải bảng công nợ...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-red-700 dark:text-red-300">
            {error}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              {summaryCards.map((card) => (
                <div
                  key={card.key}
                  className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{card.title}</h3>
                    <div className={`p-2 rounded-lg ${card.className}`}>{card.icon}</div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{card.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{card.note}</p>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                <Coins size={18} className="text-primary-600 dark:text-primary-400" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Số công nợ theo ngày</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/40 text-gray-600 dark:text-gray-300">
                    <tr>
                      <th className="px-4 py-3 text-left">Ngày</th>
                      <th className="px-4 py-3 text-right">Số đơn</th>
                      <th className="px-4 py-3 text-right">Thu nhập thực</th>
                      <th className="px-4 py-3 text-right">Admin chiết khấu</th>
                      <th className="px-4 py-3 text-right">Nhà hàng thực nhận</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {(payload?.daily || []).map((row) => (
                      <tr key={`${row.date}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/20">
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                          {new Date(row.date).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-200">
                          {Number(row.orders_count || 0).toLocaleString('vi-VN')}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-blue-700 dark:text-blue-300">
                          {formatCurrency(Number(row.gross_revenue || 0))}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-orange-700 dark:text-orange-300">
                          {formatCurrency(Number(row.platform_commission_revenue || 0))}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-700 dark:text-emerald-300">
                          {formatCurrency(Number(row.restaurant_net_revenue || 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </AdminLayout>
    </ProtectedRoute>
  );
}
