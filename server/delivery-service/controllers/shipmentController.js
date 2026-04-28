const shipmentService = require('../services/shipmentService');

exports.createShipment = async (req, res) => {
    try {
        const { user_id, pickup, dropoff, itemInfo } = req.body;
        const shipment = await shipmentService.create(user_id, pickup, dropoff, itemInfo);
        res.status(201).json({ success: true, data: shipment });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const userId = req.query.user_id;
        const history = await shipmentService.getHistory(userId);
        res.json({ success: true, data: history });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getShipmentDetail = async (req, res) => {
    try {
        const shipmentId = req.params.id;
        const detail = await shipmentService.getDetail(shipmentId);
        if (!detail) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
        res.json({ success: true, data: detail });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.acceptShipment = async (req, res) => {
    try {
        const shipmentId = req.params.id;
        const { driver_id } = req.body;
        const shipment = await shipmentService.accept(shipmentId, driver_id);
        res.json({ success: true, message: "Nhận đơn thành công", data: shipment });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.pickupShipment = async (req, res) => {
    try {
        const shipmentId = req.params.id;
        await shipmentService.updateStatus(shipmentId, 'PICKED_UP'); 
        res.json({ success: true, message: "Đã lấy hàng và đang giao" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.completeShipment = async (req, res) => {
    try {
        const shipmentId = req.params.id;
        await shipmentService.updateStatus(shipmentId, 'DELIVERED');
        res.json({ success: true, message: "Giao hàng thành công" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
