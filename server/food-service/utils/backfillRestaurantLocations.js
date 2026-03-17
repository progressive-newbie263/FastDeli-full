const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { foodPool } = require('../config/db');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const geocodeAddress = async (address) => {
  const query = `${address}, Viet Nam`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=vi&q=${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'FastDeli/1.0 (restaurant-location-backfill)',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const latitude = Number(data[0].lat);
  const longitude = Number(data[0].lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    latitude,
    longitude,
    displayName: data[0].display_name || '',
  };
};

const upsertRestaurantLocation = async (restaurantId, longitude, latitude) => {
  await foodPool.query(
    `
      INSERT INTO restaurant_locations (restaurant_id, longitude, latitude)
      VALUES ($1, $2, $3)
      ON CONFLICT (restaurant_id)
      DO UPDATE SET
        longitude = EXCLUDED.longitude,
        latitude = EXCLUDED.latitude
    `,
    [restaurantId, longitude, latitude]
  );
};

const run = async () => {
  const startedAt = Date.now();

  try {
    console.log('[backfill] Loading restaurants that miss coordinates...');

    const { rows } = await foodPool.query(
      `
        SELECT
          r.id,
          r.name,
          r.address,
          rl.latitude,
          rl.longitude
        FROM restaurants r
        LEFT JOIN restaurant_locations rl ON rl.restaurant_id = r.id
        WHERE r.address IS NOT NULL
          AND r.address <> ''
          AND (
            rl.restaurant_id IS NULL
            OR rl.latitude IS NULL
            OR rl.longitude IS NULL
          )
        ORDER BY r.id ASC
      `
    );

    if (!rows.length) {
      console.log('[backfill] Nothing to update.');
      return;
    }

    console.log(`[backfill] Found ${rows.length} restaurants without full coordinates.`);

    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (let index = 0; index < rows.length; index += 1) {
      const item = rows[index];
      const label = `[${index + 1}/${rows.length}] #${item.id} ${item.name}`;

      try {
        const geo = await geocodeAddress(item.address);

        if (!geo) {
          skipped += 1;
          console.log(`${label} -> skipped (no geocode result)`);
          await sleep(1200);
          continue;
        }

        await upsertRestaurantLocation(item.id, geo.longitude, geo.latitude);
        updated += 1;

        console.log(
          `${label} -> updated lat=${geo.latitude.toFixed(6)} lng=${geo.longitude.toFixed(6)}`
        );

        await sleep(1200);
      } catch (error) {
        failed += 1;
        console.error(`${label} -> failed: ${error.message}`);
        await sleep(1200);
      }
    }

    const durationSec = ((Date.now() - startedAt) / 1000).toFixed(1);
    console.log(
      `[backfill] Done in ${durationSec}s. updated=${updated}, skipped=${skipped}, failed=${failed}`
    );
  } finally {
    await foodPool.end();
  }
};

run().catch((error) => {
  console.error('[backfill] Fatal error:', error);
  process.exitCode = 1;
});
