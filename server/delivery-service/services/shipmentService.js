const shipmentRepo = require('../repositories/shipmentRepo');

const BASE_FEE = 15000;
const PER_KM_FEE = 5000;

// Giả lập tính khoảng cách P2P (đơn giản, trả về ngẫu nhiên km để demo)
const calculateDistanceMock = (pickupLat, pickupLng, dropoffLat, dropoffLng) => {
    return Math.floor(Math.random() * 8) + 2; // Từ 2 đến 10km
};

class ShipmentService {
    async create(userId, pickupStop, dropoffStop, itemInfo) {
        const distance = calculateDistanceMock(pickupStop.lat, pickupStop.lng, dropoffStop.lat, dropoffStop.lng);
        const price = BASE_FEE + (distance * PER_KM_FEE);

        const shipment = await shipmentRepo.createShipment(userId, price, pickupStop, dropoffStop, itemInfo);
        
        // Bắt đầu mô phỏng giao hàng ngay sau khi tạo đơn
        this.startSimulation(shipment.id);
        
        return shipment;
    }

    // Mô phỏng luồng giao hàng tự động cho demo
    async startSimulation(shipmentId) {
        const delays = {
            ASSIGN: 3000,   // 3 giây sau có tài xế nhận
            PICKUP: 7000,   // 7 giây sau tài xế lấy hàng
            COMPLETE: 15000 // 15 giây sau giao hàng thành công
        };

        setTimeout(async () => {
            console.log(`[Simulation] Shipment ${shipmentId}: Driver Assigned`);
            await shipmentRepo.assignDriver(shipmentId, 888); // Mock driver 888
        }, delays.ASSIGN);

        setTimeout(async () => {
            console.log(`[Simulation] Shipment ${shipmentId}: Picked Up`);
            await shipmentRepo.updateStatus(shipmentId, 'PICKED_UP');
        }, delays.PICKUP);

        setTimeout(async () => {
            console.log(`[Simulation] Shipment ${shipmentId}: Delivered`);
            await shipmentRepo.updateStatus(shipmentId, 'DELIVERED');
        }, delays.COMPLETE);
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
