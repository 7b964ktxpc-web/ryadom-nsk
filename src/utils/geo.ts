import { CityInfo, DistrictInfo, DistrictName } from "../types";

export const NOVOSIBIRSK_DISTRICTS: DistrictInfo[] = [
  {
    id: "oktyabrsky",
    name: "Октябрьский",
    center: [55.0188, 82.9734],
    description: "Метро Октябрьская, Речной Вокзал, ГПНТБ, ул. Кирова, Большевистская",
  },
  {
    id: "centralny",
    name: "Центральный",
    center: [55.0302, 82.9204],
    description: "Площадь Ленина, Красный проспект, Оперный театр, Центральный парк",
  },
  {
    id: "zheleznodorozhny",
    name: "Железнодорожный",
    center: [55.0354, 82.9023],
    description: "Вокзал Новосибирск-Главный, Челюскинцев, Цирк, Нарымский сквер",
  },
  {
    id: "zaeltsovsky",
    name: "Заельцовский",
    center: [55.0682, 82.8988],
    description: "Метро Заельцовская, ПКиО Заельцовский, Зоопарк, пл. Калинина",
  },
  {
    id: "dzerzhinsky",
    name: "Дзержинский",
    center: [55.0519, 82.9863],
    description: "Метро Берёзовая Роща, Проспект Дзержинского, Сад Дзержинского",
  },
  {
    id: "kalininsky",
    name: "Калининский",
    center: [55.0886, 82.9467],
    description: "Ул. Богдана Хмельницкого, Родники, Снегири, ЛДС Сибирь",
  },
  {
    id: "kirovsky",
    name: "Кировский",
    center: [54.9628, 82.9249],
    description: "МЕГА, Бугринский мост, Северо-Чемской, Затулинка",
  },
  {
    id: "leninsky",
    name: "Ленинский",
    center: [54.9899, 82.8631],
    description: "Площадь Маркса, Монумент Славы, Горский микрорайон, Ватутина",
  },
  {
    id: "pervomaysky",
    name: "Первомайский",
    center: [54.9632, 83.0768],
    description: "Бердское шоссе, ул. Первомайская, Весенний жилмассив",
  },
  {
    id: "sovetsky",
    name: "Советский",
    center: [54.8488, 83.0935],
    description: "Академгородок, Морской проспект, НГУ, Обское море, Шлюз",
  },
];

export const SUPPORTED_CITIES: CityInfo[] = [
  {
    id: "nsk",
    name: "Новосибирск",
    isDefault: true,
    center: [55.0188, 82.9734],
    districts: NOVOSIBIRSK_DISTRICTS,
  },
  {
    id: "berdsk",
    name: "Бердск",
    isDefault: false,
    center: [54.7578, 83.1065],
    districts: [
      {
        id: "berdsk_center",
        name: "Центральный",
        center: [54.7578, 83.1065],
        description: "Центр Бердска, ул. Ленина",
      },
    ],
  },
  {
    id: "krasnoobsk",
    name: "Краснообск",
    isDefault: false,
    center: [54.9192, 82.9904],
    districts: [
      {
        id: "krasnoobsk_center",
        name: "Центральный",
        center: [54.9192, 82.9904],
        description: "ВАСХНИЛ, Краснообск",
      },
    ],
  },
  {
    id: "ob",
    name: "Обь",
    isDefault: false,
    center: [54.9897, 82.7214],
    districts: [
      {
        id: "ob_center",
        name: "Центральный",
        center: [54.9897, 82.7214],
        description: "Город Обь, район Толмачёво",
      },
    ],
  },
];

// Calculate Haversine distance in meters
export function calculateDistanceMeters(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;

  const R = 6371000; // meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Human-friendly distance display (450 м, 1,2 км, etc.)
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    // Round to nearest 50m for privacy and elegance
    const rounded = Math.max(100, Math.round(meters / 50) * 50);
    return `${rounded} м`;
  }
  const km = (meters / 1000).toFixed(1).replace(".", ",");
  return `${km} км`;
}

// External map routing links
export function getDistanceKm(coord1: [number, number], coord2: [number, number]): number {
  return Number((calculateDistanceMeters(coord1, coord2) / 1000).toFixed(2));
}

export function get2GisUrl(coord: [number, number], title: string = "Новосибирск"): string {
  const [lat, lng] = coord;
  return `https://2gis.ru/novosibirsk/search/${encodeURIComponent(title)}/geo/${lng},${lat}`;
}

export function getYandexMapsUrl(coord: [number, number], title: string = "Новосибирск"): string {
  const [lat, lng] = coord;
  return `https://yandex.ru/maps/65/novosibirsk/?ll=${lng}%2C${lat}&z=16&text=${encodeURIComponent(title)}`;
}

// Generate slightly jittered coordinates within district to respect privacy (#12, #32)
export function getApproxCoordinatesForDistrict(districtName: DistrictName): [number, number] {
  const district = NOVOSIBIRSK_DISTRICTS.find((d) => d.name === districtName) || NOVOSIBIRSK_DISTRICTS[0];
  const [lat, lng] = district.center;
  // Offset by up to ~400 meters randomly
  const latOffset = (Math.random() - 0.5) * 0.006;
  const lngOffset = (Math.random() - 0.5) * 0.009;
  return [Number((lat + latOffset).toFixed(5)), Number((lng + lngOffset).toFixed(5))];
}
