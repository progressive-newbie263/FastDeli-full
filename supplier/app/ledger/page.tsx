'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookOpen, CalendarDays, HandCoins, Percent, Store } from 'lucide-react';
import SupplierLayout from '../components/SupplierLayout';
import { useSupplierAuth } from '../contexts/SupplierAuthContext';
import SupplierAPI from '../lib/api';
import type { SupplierDebtLedger } from '../types';

const DAY_OPTIONS = [7, 14, 30] as const;

type DayOption = (typeof DAY_OPTIONS)[number];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount || 0);
};

export default function SupplierLedgerPage() {
  const { restaurant, isLoading: authLoading } = useSupplierAuth();
  const [days, setDays] = useState<DayOption>(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ledger, setLedger] = useState<SupplierDebtLedger | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!restaurant?.id) {
      setLoading(false);
      return;
    }

    const loadLedger = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await SupplierAPI.getDebtLedger(restaurant.id, days);
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Không tải được bảng công nợ của nhà hàng.');
        }

        setLedger(response.data);
      } catch (err) {
        setLedger(null);
        setError(err instanceof Error ? err.message : 'Không thể tải bảng công nợ của nhà hàng.');
      } finally {
        setLoading(false);
      }
    };

    loadLedger();
  }, [authLoading, restaurant?.id, days]);

  const summaryCards = useMemo(() => {
    const summary = ledger?.summary;
    const commissionRate = Number(ledger?.commission_rate || 0);

    return [
      {
        key: 'gross',
        title: 'Thu nhập thực',
        value: formatCurrency(Number(summary?.gross_revenue || 0)),
        note: `Tổng doanh thu ${days} ngày`,
        iconClass: 'bg-blue-100 text-blue-600',
        icon: <HandCoins size={18} />,
      },
      {
        key: 'net',
        title: 'Thu nhập ròng của nhà hàng',
        value: formatCurrency(Number(summary?.net_revenue || 0)),
        note: 'Đã trừ hoa hồng nên tăng',
        iconClass: 'bg-emerald-100 text-emerald-600',
        icon: <Store size={18} />,
      },
      {
        key: 'commission',
        title: 'Chi phí chiết khấu',
        value: formatCurrency(Number(summary?.commission_amount || 0)),
        note: `Tỷ lệ ${(commissionRate * 100).toFixed(1)}%`,
        iconClass: 'bg-orange-100 text-orange-600',
        icon: <Percent size={18} />,
      },
    ];
  }, [days, ledger]);

  return (
    <SupplierLayout title="Bảng công nợ" subtitle="Thu nhập thực theo ngày của nhà hàng">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="text-sm text-gray-600 flex items-center gap-2">
          <CalendarDays size={16} />
          Theo dõi thu nhập thực và thu nhập ròng sau chiết khấu.
        </div>

        <div className="flex items-center gap-2">
          {DAY_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => setDays(option)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                option === days
                  ? 'bg-orange-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {option} ngày
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 mx-auto" />
          <p className="mt-4 text-gray-600">Đang tải dữ liệu công nợ...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {summaryCards.map((card) => (
              <div key={card.key} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">{card.title}</h3>
                  <div className={`p-2 rounded-lg ${card.iconClass}`}>{card.icon}</div>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
                <p className="text-xs text-gray-500">{card.note}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <BookOpen size={18} className="text-orange-600" />
              <h3 className="text-base font-semibold text-gray-900">Chi tiết theo ngày</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left">Ngày</th>
                    <th className="px-4 py-3 text-right">Số đơn</th>
                    <th className="px-4 py-3 text-right">Thu nhập thực</th>
                    <th className="px-4 py-3 text-right">Chiết khấu</th>
                    <th className="px-4 py-3 text-right">Thu nhập ròng</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {(ledger?.daily || []).map((row) => (
                    <tr key={`${row.date}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900">
                        {new Date(row.date).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {Number(row.orders_count || 0).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-4 py-3 text-right text-blue-700 font-medium">
                        {formatCurrency(Number(row.gross_revenue || 0))}
                      </td>
                      <td className="px-4 py-3 text-right text-orange-700 font-medium">
                        {formatCurrency(Number(row.commission_amount || 0))}
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-700 font-semibold">
                        {formatCurrency(Number(row.net_revenue || 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </SupplierLayout>
  );
}
