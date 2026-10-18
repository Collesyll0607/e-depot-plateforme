export interface VilleCoordonnees {
  nom: string;
  lat: number;
  lng: number;
  region: string;
}

export const VILLES_CASAMANCE: Record<string, VilleCoordonnees> = {
  Ziguinchor: { nom: 'Ziguinchor', lat: 12.568, lng: -16.273, region: 'Ziguinchor' },
  Bignona: { nom: 'Bignona', lat: 12.810, lng: -16.230, region: 'Ziguinchor' },
  Oussouye: { nom: 'Oussouye', lat: 12.486, lng: -16.546, region: 'Ziguinchor' },
  'Cap Skirring': { nom: 'Cap Skirring', lat: 12.352, lng: -16.748, region: 'Ziguinchor' },
  Kafountine: { nom: 'Kafountine', lat: 12.930, lng: -16.748, region: 'Ziguinchor' },
  Diouloulou: { nom: 'Diouloulou', lat: 13.045, lng: -16.650, region: 'Ziguinchor' },
  Sédhiou: { nom: 'Sédhiou', lat: 12.708, lng: -15.556, region: 'Sédhiou' },
  Marsassoum: { nom: 'Marsassoum', lat: 12.828, lng: -15.981, region: 'Sédhiou' },
  Goudomp: { nom: 'Goudomp', lat: 12.576, lng: -15.871, region: 'Sédhiou' },
  Kolda: { nom: 'Kolda', lat: 12.883, lng: -14.950, region: 'Kolda' },
  Vélingara: { nom: 'Vélingara', lat: 13.150, lng: -14.116, region: 'Kolda' },
  Kaolack: { nom: 'Kaolack', lat: 14.139, lng: -16.074, region: 'Kaolack' },
  Dakar: { nom: 'Dakar', lat: 14.716, lng: -17.467, region: 'Dakar' },
  Tambacounda: { nom: 'Tambacounda', lat: 13.771, lng: -13.667, region: 'Tambacounda' },
};

export const LISTE_VILLES = Object.keys(VILLES_CASAMANCE);

/**
 * Génère le lien officiel pour ouvrir l'itinéraire directement dans Google Maps
 */
export function getGoogleMapsDirectionsUrl(
  departVille: string,
  arriveeVille: string,
  positionActuelle?: { lat: number; lng: number }
): string {
  const originStr = positionActuelle
    ? `${positionActuelle.lat},${positionActuelle.lng}`
    : encodeURIComponent(`${departVille}, Casamance, Sénégal`);
  const destStr = encodeURIComponent(`${arriveeVille}, Casamance, Sénégal`);
  return `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destStr}&travelmode=driving`;
}

/**
 * Génère le lien pour ouvrir une coordonnée exacte dans Google Maps
 */
export function getGoogleMapsLocationUrl(lat: number, lng: number, label?: string): string {
  const query = label ? `${lat},${lng}+(${encodeURIComponent(label)})` : `${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

/**
 * Génère l'URL d'intégration Iframe Google Maps sans clé d'API
 */
export function getGoogleMapsEmbedUrl(departVille: string, arriveeVille: string): string {
  const query = encodeURIComponent(`itineraire de ${departVille} a ${arriveeVille} Senegal`);
  return `https://maps.google.com/maps?q=${query}&t=&z=10&ie=UTF8&iwloc=&output=embed`;
}

/**
 * Points de passage routiers réalistes pour les axes de Casamance
 */
export function getRoadCoordinates(depart: string, arrivee: string): [number, number][] {
  const villeA = VILLES_CASAMANCE[depart] || VILLES_CASAMANCE['Ziguinchor'];
  const villeB = VILLES_CASAMANCE[arrivee] || VILLES_CASAMANCE['Bignona'];

  const ptA: [number, number] = [villeA.lat, villeA.lng];
  const ptB: [number, number] = [villeB.lat, villeB.lng];

  // Axe Ziguinchor <-> Bignona (N4 via Pont Emile Badiane & Tobor)
  if (
    (depart === 'Ziguinchor' && arrivee === 'Bignona') ||
    (depart === 'Bignona' && arrivee === 'Ziguinchor')
  ) {
    const pts: [number, number][] = [
      [12.568, -16.273],
      [12.593, -16.287], // Pont Emile Badiane
      [12.635, -16.275],
      [12.673, -16.262], // Tobor
      [12.740, -16.245],
      [12.810, -16.230], // Bignona
    ];
    return depart === 'Bignona' ? pts.reverse() : pts;
  }

  // Axe Ziguinchor <-> Cap Skirring (R20 via Oussouye)
  if (
    (depart === 'Ziguinchor' && arrivee === 'Cap Skirring') ||
    (depart === 'Cap Skirring' && arrivee === 'Ziguinchor')
  ) {
    const pts: [number, number][] = [
      [12.568, -16.273],
      [12.535, -16.325],
      [12.518, -16.395], // Brin
      [12.495, -16.465], // Nyassia
      [12.486, -16.546], // Oussouye
      [12.415, -16.635], // Cabanor
      [12.352, -16.748], // Cap Skirring
    ];
    return depart === 'Cap Skirring' ? pts.reverse() : pts;
  }

  // Axe Ziguinchor <-> Oussouye
  if (
    (depart === 'Ziguinchor' && arrivee === 'Oussouye') ||
    (depart === 'Oussouye' && arrivee === 'Ziguinchor')
  ) {
    const pts: [number, number][] = [
      [12.568, -16.273],
      [12.535, -16.325],
      [12.518, -16.395],
      [12.495, -16.465],
      [12.486, -16.546],
    ];
    return depart === 'Oussouye' ? pts.reverse() : pts;
  }

  // Axe Bignona <-> Kafountine
  if (
    (depart === 'Bignona' && arrivee === 'Kafountine') ||
    (depart === 'Kafountine' && arrivee === 'Bignona')
  ) {
    const pts: [number, number][] = [
      [12.810, -16.230],
      [12.915, -16.355],
      [12.990, -16.510],
      [13.045, -16.650], // Diouloulou
      [12.975, -16.715], // Abéné
      [12.930, -16.748], // Kafountine
    ];
    return depart === 'Kafountine' ? pts.reverse() : pts;
  }

  // Axe Ziguinchor <-> Kolda (N6 via Goudomp & Tanaff)
  if (
    (depart === 'Ziguinchor' && arrivee === 'Kolda') ||
    (depart === 'Kolda' && arrivee === 'Ziguinchor')
  ) {
    const pts: [number, number][] = [
      [12.568, -16.273],
      [12.576, -15.871], // Goudomp
      [12.650, -15.500], // Tanaff
      [12.780, -15.200], // Samine
      [12.883, -14.950], // Kolda
    ];
    return depart === 'Kolda' ? pts.reverse() : pts;
  }

  // Ligne routière directe avec courbure
  return [
    ptA,
    [(ptA[0] + ptB[0]) / 2 + 0.015, (ptA[1] + ptB[1]) / 2 - 0.01],
    ptB,
  ];
}

/**
 * Calcul de distance à vol d'oiseau (formule de Haversine)
 * pondérée par un coefficient routier estimé de 1.3
 */
export function estimerDistanceRoutiereKm(depart: string, arrivee: string): number {
  const villeA = VILLES_CASAMANCE[depart];
  const villeB = VILLES_CASAMANCE[arrivee];

  if (!villeA || !villeB) return 60; // Valeur indicative par défaut

  const R = 6371; // Rayon Terre en km
  const dLat = (villeB.lat - villeA.lat) * (Math.PI / 180);
  const dLon = (villeB.lng - villeA.lng) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(villeA.lat * (Math.PI / 180)) *
      Math.cos(villeB.lat * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceVolOiseau = R * c;

  // Facteur de sinuosité routière en Casamance/Sénégal
  return Math.round(distanceVolOiseau * 1.3);
}

/**
 * Durée estimée en camion (vitesse moyenne 50 km/h compte tenu des axes et péages)
 */
export function estimerDureeHeures(distanceKm: number): number {
  return distanceKm / 50;
}
