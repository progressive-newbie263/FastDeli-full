async function geocodeAddress(address) {
  if (!address || typeof address !== 'string') return null;

  const q = address.trim();
  if (!q) return null;

  // Forward geocoding via OpenStreetMap Nominatim
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
    q
  )}&accept-language=vi`;

  const resp = await fetch(url, { headers: { 'User-Agent': 'fastdeli-driver-service' } });
  if (!resp.ok) return null;

  const data = await resp.json();
  if (!Array.isArray(data) || data.length === 0) return null;

  const lat = Number(data[0]?.lat);
  const lng = Number(data[0]?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return { lat, lng };
}

module.exports = { geocodeAddress };

