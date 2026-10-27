interface OSMCompetitor {
  name: string
  rating: string | number
  total: number
  address: string
}

function getOSMQueryForBiz(bizType: string, lat: number, lon: number): string {
  const clean = bizType.toLowerCase();
  const radius = 2000; // 2km radius search

  if (clean.includes('salon') || clean.includes('hair') || clean.includes('beauty') || clean.includes('parlour') || clean.includes('spa')) {
    return `node["shop"~"hairdresser|beauty|salon|spa"](around:${radius}, ${lat}, ${lon});`;
  }
  if (clean.includes('cafe') || clean.includes('coffee') || clean.includes('tea') || clean.includes('chai') || clean.includes('stall')) {
    return `node["amenity"~"cafe|fast_food"](around:${radius}, ${lat}, ${lon});`;
  }
  if (clean.includes('restaurant') || clean.includes('food') || clean.includes('eating') || clean.includes('hotel') || clean.includes('dhaba')) {
    return `node["amenity"~"restaurant|fast_food|food_court"](around:${radius}, ${lat}, ${lon});`;
  }
  if (clean.includes('boutique') || clean.includes('cloth') || clean.includes('garment') || clean.includes('fashion') || clean.includes('wear')) {
    return `node["shop"~"clothes|boutique|fashion"](around:${radius}, ${lat}, ${lon});`;
  }
  if (clean.includes('gym') || clean.includes('fitness') || clean.includes('workout')) {
    return `node["leisure"~"fitness_centre|gym"](around:${radius}, ${lat}, ${lon});`;
  }
  if (clean.includes('optical') || clean.includes('spectacle') || clean.includes('lens')) {
    return `node["shop"="optician"](around:${radius}, ${lat}, ${lon});`;
  }
  if (clean.includes('grocery') || clean.includes('supermarket') || clean.includes('kirana') || clean.includes('mart') || clean.includes('shop')) {
    return `node["shop"~"supermarket|convenience|grocery"](around:${radius}, ${lat}, ${lon});`;
  }
  if (clean.includes('bakery') || clean.includes('cake') || clean.includes('sweet')) {
    return `node["shop"~"bakery|confectionery"](around:${radius}, ${lat}, ${lon});`;
  }
  if (clean.includes('chemist') || clean.includes('pharmacy') || clean.includes('medical')) {
    return `node["shop"="chemist"](around:${radius}, ${lat}, ${lon});`;
  }

  // Generic fallback: match tags containing shop or food amenity
  return `node["shop"](around:${radius}, ${lat}, ${lon}); node["amenity"~"restaurant|cafe|fast_food"](around:${radius}, ${lat}, ${lon});`;
}

export async function fetchOSMCompetitors(bizType: string, location: string): Promise<OSMCompetitor[] | null> {
  try {
    // 1. Geocode location using Nominatim with a fast 3s timeout
    const searchUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location + ', India')}&format=json&limit=1`;
    const searchRes = await fetch(searchUrl, {
      headers: { 'User-Agent': 'BizBoost/1.0 (contact@bizboost.com)' },
      signal: AbortSignal.timeout(3000),
      next: { revalidate: 3600 } // Cache for 1 hour
    }).catch(() => null);
    
    if (!searchRes || !searchRes.ok) return null;
    const searchData = await searchRes.json().catch(() => null);
    if (!searchData || searchData.length === 0) return null;

    const lat = parseFloat(searchData[0].lat);
    const lon = parseFloat(searchData[0].lon);

    // 2. Fetch shops/amenities using Overpass API with a fast 4s timeout
    const osmQuery = getOSMQueryForBiz(bizType, lat, lon);
    const overpassQuery = `[out:json][timeout:4];(${osmQuery});out body 10;`;
    
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
    const overpassRes = await fetch(overpassUrl, {
      signal: AbortSignal.timeout(4000),
      next: { revalidate: 3600 }
    }).catch(() => null);

    if (!overpassRes || !overpassRes.ok) return null;
    const overpassData = await overpassRes.json().catch(() => null);

    if (!overpassData || !overpassData.elements || overpassData.elements.length === 0) {
      return [];
    }

    return overpassData.elements.map((item: any) => {
      const name = item.tags?.name || item.tags?.brand || `${bizType} Store`;
      const road = item.tags?.['addr:street'] || item.tags?.['addr:place'] || '';
      const suburb = item.tags?.['addr:suburb'] || item.tags?.['addr:neighbourhood'] || '';
      const city = item.tags?.['addr:city'] || '';
      const fullAddress = [road, suburb, city].filter(Boolean).join(', ') || 'Local area';

      return {
        name,
        rating: 'Map Data', // Label indicating it's real physical map data
        total: 0,           // OSM doesn't track user rating counts
        address: fullAddress
      };
    });
  } catch (err) {
    console.error('Error fetching OpenStreetMap competitors:', err);
    return null;
  }
}
