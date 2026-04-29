const shipmentRepo = require('../repositories/shipmentRepo');
const { calculatePrice } = require('../utils/pricing');

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

class ShipmentService {
    async create(userId, pickupStop, dropoffStop, itemInfo) {
        // Tính toán khoảng cách thực tế
        const distance = getDistance(
            pickupStop.lat, pickupStop.lng, 
            dropoffStop.lat, dropoffStop.lng
        );
        
        // Tính giá dựa trên khoảng cách và khối lượng
        const price = calculatePrice(distance, itemInfo.weight);

        const shipment = await shipmentRepo.createShipment(userId, price, pickupStop, dropoffStop, itemInfo);
        
        // Đơn hàng sẽ chờ tài xế nhận bên driver-app, không tự động mô phỏng nữa
        // this.startSimulation(shipment.id); 
        
        return { ...shipment, distance: parseFloat(distance.toFixed(2)) };
    }

    // Giữ lại hàm mô phỏng để tham khảo hoặc dùng cho test thủ công nếu cần
    async startSimulation(shipmentId) {
        const delays = {
            ASSIGN: 3000,
            PICKUP: 7000,
            COMPLETE: 15000
        };

        setTimeout(async () => {
            console.log(`[Simulation] Shipment ${shipmentId}: Driver Assigned`);
            await shipmentRepo.assignDriver(shipmentId, 888); 
        }, delays.ASSIGN);

        // ... các bước tiếp theo tương tự
    }

    async getHistory(userId) {
        return await shipmentRepo.getShipmentsByUserId(userId);
    }

    async getDetail(shipmentId) {
        return await shipmentRepo.getShipmentDetail(shipmentId);
    }

    async accept(shipmentId, driverId) {
        const updated = await shipmentRepo.assignDriver(shipmentId, driverId);
        if (!updated) throw new Error("Chuyến đi đã có người nhận hoặc bị hủy!");
        return updated;
    }

    async updateStatus(shipmentId, newStatus) {
        return await shipmentRepo.updateStatus(shipmentId, newStatus);
    }
}

module.exports = new ShipmentService();

