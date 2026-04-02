function toRad(deg) {
  return (deg * Math.PI) / 180;
}

// Haversine distance in meters (good enough for small radii)
function distanceMeters(a, b) {
  const R = 6371000;

  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);

  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  return 2 * R * Math.asin(Math.sqrt(h));
}

module.exports = { distanceMeters };

