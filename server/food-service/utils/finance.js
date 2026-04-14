const parseRate = (raw, fallback = 0.2) => {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  // Accept either ratio (0.2) or percent (20)
  if (parsed > 1) {
    return Math.min(Math.max(parsed / 100, 0), 0.95);
  }

  return Math.min(Math.max(parsed, 0), 0.95);
};

const PLATFORM_COMMISSION_RATE = parseRate(process.env.PLATFORM_COMMISSION_RATE, 0.2);

const roundMoney = (value) => {
  const normalized = Number(value || 0);
  if (!Number.isFinite(normalized)) {
    return 0;
  }
  return Number(normalized.toFixed(2));
};

const calcCommission = (grossAmount) => roundMoney(Number(grossAmount || 0) * PLATFORM_COMMISSION_RATE);

const calcRestaurantNet = (grossAmount) => roundMoney(Number(grossAmount || 0) - calcCommission(grossAmount));

module.exports = {
  PLATFORM_COMMISSION_RATE,
  roundMoney,
  calcCommission,
  calcRestaurantNet,
};
