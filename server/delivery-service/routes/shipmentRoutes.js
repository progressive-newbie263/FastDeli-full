const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');
const auth = require('../middleware/auth');

router.post('/', auth, shipmentController.createShipment);
router.get('/history', auth, shipmentController.getHistory);
router.get('/:id', shipmentController.getShipmentDetail);
router.post('/:id/accept', shipmentController.acceptShipment);
router.post('/:id/pickup', shipmentController.pickupShipment);
router.post('/:id/complete', shipmentController.completeShipment);

module.exports = router;
