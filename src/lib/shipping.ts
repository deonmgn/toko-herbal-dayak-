export type ShippingOption = {
  courier: string
  service: string
  description: string
  cost: number
  etd: string
}

const RAJAONGKIR_API = 'https://api.rajaongkir.com/starter'
const API_KEY = process.env.RAJAONGKIR_API_KEY || ''
const ORIGIN_CITY = process.env.SHIP_ORIGIN_CITY_ID || '365'

const DEFAULT_CITIES = [
  { id: '365', name: 'Kota Pontianak', province: 'Kalimantan Barat', postalCode: '78111' },
  { id: '326', name: 'Kota Palangka Raya', province: 'Kalimantan Tengah', postalCode: '73112' },
  { id: '36', name: 'Kota Banjarmasin', province: 'Kalimantan Selatan', postalCode: '70111' },
  { id: '402', name: 'Kota Samarinda', province: 'Kalimantan Timur', postalCode: '75111' },
  { id: '35', name: 'Kota Balikpapan', province: 'Kalimantan Timur', postalCode: '76111' },
  { id: '151', name: 'Kota Jakarta Barat', province: 'DKI Jakarta', postalCode: '11220' },
  { id: '152', name: 'Kota Jakarta Pusat', province: 'DKI Jakarta', postalCode: '10110' },
  { id: '153', name: 'Kota Jakarta Selatan', province: 'DKI Jakarta', postalCode: '12110' },
  { id: '154', name: 'Kota Jakarta Timur', province: 'DKI Jakarta', postalCode: '13330' },
  { id: '155', name: 'Kota Jakarta Utara', province: 'DKI Jakarta', postalCode: '14110' },
  { id: '444', name: 'Kota Surabaya', province: 'Jawa Timur', postalCode: '60119' },
  { id: '23', name: 'Kota Bandung', province: 'Jawa Barat', postalCode: '40111' },
  { id: '399', name: 'Kota Semarang', province: 'Jawa Tengah', postalCode: '50134' },
  { id: '501', name: 'Kota Yogyakarta', province: 'DI Yogyakarta', postalCode: '55111' },
  { id: '278', name: 'Kota Medan', province: 'Sumatera Utara', postalCode: '20111' },
  { id: '254', name: 'Kota Makassar', province: 'Sulawesi Selatan', postalCode: '90111' },
  { id: '114', name: 'Kota Denpasar', province: 'Bali', postalCode: '80232' },
];

export async function getCities(search?: string) {
  const isKeyConfigured = API_KEY && API_KEY !== 'your_rajaongkir_api_key';

  if (isKeyConfigured) {
    try {
      const response = await fetch(`${RAJAONGKIR_API}/city`, {
        method: 'GET',
        headers: { key: API_KEY }
      });
      const data = await response.json();
      let cities = data.rajaongkir?.results || [];

      if (search) {
        const query = search.toLowerCase();
        cities = cities.filter((city: any) =>
          city.city_name?.toLowerCase().includes(query) ||
          city.province?.toLowerCase().includes(query)
        );
      }

      if (cities.length > 0) {
        return cities.map((city: any) => ({
          id: String(city.city_id),
          name: `${city.type} ${city.city_name}`,
          province: city.province,
          postalCode: city.postal_code
        }));
      }
    } catch (e) {
      console.warn('RajaOngkir city fetch failed, using fallback list:', e);
    }
  }

  // Fallback to default Indonesian cities
  if (search) {
    const q = search.toLowerCase();
    return DEFAULT_CITIES.filter(c =>
      c.name.toLowerCase().includes(q) || c.province.toLowerCase().includes(q)
    );
  }
  return DEFAULT_CITIES;
}

export async function calculateShipping(destinationCityId: string, weightGrams: number, courier: string): Promise<ShippingOption[]> {
  const isKeyConfigured = API_KEY && API_KEY !== 'your_rajaongkir_api_key';

  if (isKeyConfigured) {
    try {
      const response = await fetch(`${RAJAONGKIR_API}/cost`, {
        method: 'POST',
        headers: {
          key: API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          origin: ORIGIN_CITY,
          destination: destinationCityId,
          weight: Math.max(100, weightGrams).toString(),
          courier: courier.toLowerCase()
        })
      });

      const data = await response.json();
      const results = data.rajaongkir?.results?.[0]?.costs || [];
      const courierCode = data.rajaongkir?.results?.[0]?.code?.toUpperCase() || courier.toUpperCase();

      if (results.length > 0) {
        return results.map((cost: any) => ({
          courier: courierCode,
          service: cost.service,
          description: cost.description,
          cost: cost.cost[0]?.value || 30000,
          etd: cost.cost[0]?.etd || '2-4'
        }));
      }
    } catch (e) {
      console.warn('RajaOngkir cost fetch failed, using realistic fallback:', e);
    }
  }

  // Realistic shipping fallback from Kalimantan
  const kg = Math.ceil(weightGrams / 1000) || 1;
  const isKalimantan = ['365', '326', '36', '402', '35'].includes(destinationCityId);
  const baseRate = isKalimantan ? 24000 : 34000;

  return [
    {
      courier: 'JNE',
      service: 'REG',
      description: 'Layanan Reguler JNE',
      cost: baseRate * kg,
      etd: isKalimantan ? '2-3 Hari' : '3-4 Hari'
    },
    {
      courier: 'J&T',
      service: 'EZ',
      description: 'J&T Regular Express',
      cost: (baseRate + 2000) * kg,
      etd: isKalimantan ? '2-3 Hari' : '3-5 Hari'
    },
    {
      courier: 'POS',
      service: 'KILAT',
      description: 'Pos Kilat Khusus',
      cost: (baseRate - 3000) * kg,
      etd: isKalimantan ? '2-4 Hari' : '4-5 Hari'
    }
  ];
}
