const express = require('express');
const cors = require('cors');

const { initDriverTables } = require('./db/initDriverTables');
const driverRoutes = require('./routes/driverRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'driver-service' });
});

app.use('/api/driver', driverRoutes);

const PORT = process.env.DRIVER_SERVICE_PORT ? Number(process.env.DRIVER_SERVICE_PORT) : 5004;
const HOST = process.env.HOST || '0.0.0.0';

initDriverTables()
  .then(() => {
    app.listen(PORT, HOST, () => {
      console.log(`driver-service running on ${HOST}:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[driver-service] failed to init tables:', err);
    process.exit(1);
  });

