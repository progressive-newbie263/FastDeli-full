/**
 * Pricing Utility for FastDeli Delivery Service
 */

const CONFIG = {
    BASE_FEE: 15000,    // Phí cơ bản cho 2km đầu tiên
    PER_KM_FEE: 5000,   // Phí mỗi km tiếp theo
    WEIGHT_SURCHARGES: {
        'Dưới 5kg': 0,
        '5kg - 10kg': 10000,
        'Trên 10kg': 25000
    }
};

/**
 * Tính toán phí vận chuyển
 * @param {number} distanceKm Khoảng cách tính bằng km
 * @param {string} weight Mốc khối lượng
 * @returns {number} Tổng số tiền (VND)
 */
function calculatePrice(distanceKm, weight) {
    let price = CONFIG.BASE_FEE;

    // Nếu khoảng cách > 2km, tính thêm phí km
    if (distanceKm > 2) {
        price += (distanceKm - 2) * CONFIG.PER_KM_FEE;
    }

    // Cộng thêm phụ phí khối lượng
    const surcharge = CONFIG.WEIGHT_SURCHARGES[weight] || 0;
    price += surcharge;

    // Làm tròn đến hàng nghìn
    return Math.ceil(price / 1000) * 1000;
}

module.exports = {
    calculatePrice,
    CONFIG
};
