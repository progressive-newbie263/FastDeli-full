"use client";

import { useEffect, useState } from 'react';
import OrdersPageClient from './OrdersPageClient';

export default function OrdersPage() {
  const [initialOrders, setInitialOrders] = useState([]);

  useEffect(() => {
    const storedData = localStorage.getItem('userData');
    if (!storedData) return;

    const parsed = JSON.parse(storedData);
    const userId = parsed.user_id;
    if (!userId) return;

    fetch(`http://localhost:5001/api/orders/user/${userId}`)
      .then((res) => res.json())
      .then((data) => setInitialOrders(data?.data || []));
  }, []);

  return <OrdersPageClient initialOrders={initialOrders} />;
}
