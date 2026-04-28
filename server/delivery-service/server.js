const express = require('express');
const cors = require('cors');

const app = express();
const port = Number(process.env.DELIVERY_SERVICE_PORT || 5002);

const driverRoutes = require('./routes/driverRoutes');
const shipmentRoutes = require('./routes/shipmentRoutes');

app.use(cors());
app.use(express.json());

app.use('/api/driver', driverRoutes);
app.use('/api/shipments', shipmentRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Delivery service is running.',
  });
});

app.use((err, req, res, next) => {
  console.error('[delivery-service] unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Lỗi hệ thống.',
  });
});

app.listen(port, () => {
  console.log(`Delivery service running on port ${port}`);
});
