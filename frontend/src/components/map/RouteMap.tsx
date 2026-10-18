import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  VILLES_CASAMANCE,
  getGoogleMapsDirectionsUrl,
  getGoogleMapsLocationUrl,
  getGoogleMapsEmbedUrl,
  getRoadCoordinates,
  estimerDistanceRoutiereKm,
  estimerDureeHeures,
} from '../../lib/geo';
import { PositionGPS } from '../../types';
import { Button } from '../ui/Button';
import {
  ExternalLink,
  Navigation,
  Crosshair,
  Play,
  Pause,
  MapPin,
  Truck,
  Layers,
  Compass,
  CheckCircle2,
} from 'lucide-react';

interface RouteMapProps {
  departVille: string;
  arriveeVille: string;
  positionCamion?: PositionGPS;
  height?: string;
  showControls?: boolean;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  departVille,
  arriveeVille,
  positionCamion,
  height = '380px',
  showControls = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const truckMarkerRef = useRef<L.Marker | L.CircleMarker | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);

  // Vue sélectionnée : 'osm' (Plan), 'satellite' (Satellite), 'google' (Google Maps direct)
  const [mapMode, setMapMode] = useState<'osm' | 'satellite' | 'google'>('osm');

  // Position réelle captée par le capteur GPS de l'appareil
  const [deviceGps, setDeviceGps] = useState<{ lat: number; lng: number; precision: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Simulation de mouvement en temps réel le long de l'axe
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0.4); // 40% du parcours par défaut

  // Données de l'itinéraire
  const distanceKm = estimerDistanceRoutiereKm(departVille, arriveeVille);
  const dureeMinutes = Math.round(estimerDureeHeures(distanceKm) * 60);

  // Coordonnées de route réalistes
  const roadCoordinates = getRoadCoordinates(departVille, arriveeVille);

  // Calcul de la position courante du camion (réelle ou simulée)
  const getCurrentTruckPosition = (): [number, number] => {
    if (deviceGps) {
      return [deviceGps.lat, deviceGps.lng];
    }
    if (isSimulating || !positionCamion) {
      const totalPoints = roadCoordinates.length;
      const index = Math.min(
        Math.floor(simProgress * (totalPoints - 1)),
        totalPoints - 2
      );
      const subProgress = (simProgress * (totalPoints - 1)) - index;
      const p1 = roadCoordinates[index];
      const p2 = roadCoordinates[index + 1];
      return [
        p1[0] + (p2[0] - p1[0]) * subProgress,
        p1[1] + (p2[1] - p1[1]) * subProgress,
      ];
    }
    return [positionCamion.lat, positionCamion.lng];
  };

  const currentTruckPos = getCurrentTruckPosition();

  // Lien Google Maps dynamique
  const googleMapsDirectionsUrl = getGoogleMapsDirectionsUrl(
    departVille,
    arriveeVille,
    deviceGps ? { lat: deviceGps.lat, lng: deviceGps.lng } : { lat: currentTruckPos[0], lng: currentTruckPos[1] }
  );

  const googleMapsPointUrl = getGoogleMapsLocationUrl(
    currentTruckPos[0],
    currentTruckPos[1],
    `Camion E-Dépôt (${departVille} vers ${arriveeVille})`
  );

  // Animation de simulation
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setSimProgress((prev) => {
        if (prev >= 0.98) return 0.05; // Boucle le trajet
        return prev + 0.02;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Initialisation et mise à jour de la carte Leaflet
  useEffect(() => {
    if (mapMode === 'google' || !mapContainerRef.current) return;

    const villeDepart = VILLES_CASAMANCE[departVille] || VILLES_CASAMANCE['Ziguinchor'];
    const villeArrivee = VILLES_CASAMANCE[arriveeVille] || VILLES_CASAMANCE['Bignona'];

    // Nettoyage de l'instance précédente
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    });
    mapInstanceRef.current = map;

    // Tuiles selon le mode
    if (mapMode === 'satellite') {
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Esri, Maxar, Earthstar Geographics',
          maxZoom: 18,
        }
      ).addTo(map);

      // Couche des routes et étiquettes par-dessus
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
        {
          attribution: '© OpenStreetMap, © CARTO',
          maxZoom: 18,
        }
      ).addTo(map);
    } else {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors • Réseau routier Sénégal',
        maxZoom: 18,
      }).addTo(map);
    }

    const latlngDepart: [number, number] = [villeDepart.lat, villeDepart.lng];
    const latlngArrivee: [number, number] = [villeArrivee.lat, villeArrivee.lng];

    // Marqueur Départ
    const markerDepart = L.circleMarker(latlngDepart, {
      radius: 9,
      fillColor: '#123B2A',
      color: '#FFFFFF',
      weight: 3,
      fillOpacity: 1,
    }).addTo(map);
    markerDepart.bindPopup(
      `<b>Départ : ${villeDepart.nom}</b><br/>Point de chargement de la cargaison`
    );

    // Marqueur Arrivée
    const markerArrivee = L.circleMarker(latlngArrivee, {
      radius: 9,
      fillColor: '#E88945',
      color: '#FFFFFF',
      weight: 3,
      fillOpacity: 1,
    }).addTo(map);
    markerArrivee.bindPopup(
      `<b>Destination : ${villeArrivee.nom}</b><br/>Point de livraison & contrôle contradictoire`
    );

    // Tracé de l'axe routier réel (Casamance Highway)
    L.polyline(roadCoordinates, {
      color: '#236B4A',
      weight: 5,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Bordure esthétique du tracé routier
    L.polyline(roadCoordinates, {
      color: '#FFFFFF',
      weight: 2,
      opacity: 0.6,
      dashArray: '8, 8',
    }).addTo(map);

    // Marqueur camion en temps réel
    const truckPos = getCurrentTruckPosition();
    const truckMarker = L.circleMarker(truckPos, {
      radius: 12,
      fillColor: '#E88945',
      color: '#123B2A',
      weight: 3,
      fillOpacity: 1,
    }).addTo(map);

    truckMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 0.85rem;">
        <strong style="color: #123B2A; display: block; margin-bottom: 4px;">🚚 Camion en transit</strong>
        <div>Axe : <b>${departVille}</b> ➔ <b>${arriveeVille}</b></div>
        <div>Vitesse estimée : <b>48 km/h</b></div>
        <div>Coordonnées : ${truckPos[0].toFixed(4)}°N, ${truckPos[1].toFixed(4)}°W</div>
        <div style="margin-top: 8px;">
          <a href="${getGoogleMapsLocationUrl(truckPos[0], truckPos[1])}" target="_blank" rel="noopener noreferrer" style="color: #236B4A; font-weight: bold; text-decoration: underline;">
            📍 Ouvrir ce point dans Google Maps ↗
          </a>
        </div>
      </div>
    `);

    truckMarkerRef.current = truckMarker;

    // Centrage de la vue
    const bounds = L.latLngBounds(roadCoordinates);
    bounds.extend(truckPos);
    map.fitBounds(bounds, { padding: [40, 40] });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [departVille, arriveeVille, mapMode]);

  // Mise à jour de la position du camion sans recréer toute la carte
  useEffect(() => {
    if (!truckMarkerRef.current || mapMode === 'google') return;
    const newPos = getCurrentTruckPosition();
    truckMarkerRef.current.setLatLng(newPos);
  }, [simProgress, deviceGps]);

  // Fonction de capture du vrai GPS de l'appareil
  const handleCaptureRealGps = () => {
    if (!navigator.geolocation) {
      setGpsError("La géolocalisation n'est pas supportée par ce navigateur.");
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        setDeviceGps({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          precision: Math.round(pos.coords.accuracy),
        });
        setIsSimulating(false);

        // Recentrer la carte Leaflet sur la position réelle
        if (mapInstanceRef.current) {
          const latlng: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          mapInstanceRef.current.setView(latlng, 14);

          // Ajout du rayon de précision
          if (userMarkerRef.current) {
            userMarkerRef.current.remove();
          }
          userMarkerRef.current = L.circleMarker(latlng, {
            radius: 14,
            fillColor: '#1F6F8B',
            color: '#FFFFFF',
            weight: 3,
            fillOpacity: 0.9,
          }).addTo(mapInstanceRef.current);

          userMarkerRef.current.bindPopup(
            `<b>📍 Votre position réelle exacte</b><br/>Précision : ±${Math.round(pos.coords.accuracy)}m`
          ).openPopup();
        }
      },
      (err) => {
        setGpsLoading(false);
        setGpsError(
          err.code === 1
            ? "Accès au GPS refusé. Veuillez autoriser la localisation dans votre navigateur."
            : "Impossible d'obtenir la position GPS réelle."
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div style={{ width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF' }}>
      {/* Barre d'outils supérieure de Géolocalisation & Google Maps */}
      {showControls && (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#FAFBF9',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          {/* Indicateur télématique */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: deviceGps ? '#1F6F8B' : '#236B4A',
                backgroundColor: deviceGps ? '#E6F3F7' : '#E8F2EC',
                padding: '4px 10px',
                borderRadius: '20px',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: deviceGps ? '#1F6F8B' : '#236B4A',
                  display: 'inline-block',
                }}
              />
              {deviceGps ? `GPS réel actif (±${deviceGps.precision}m)` : isSimulating ? 'Suivi dynamique en direct' : 'Balise GPS active'}
            </span>

            <span style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
              Axe <b>{departVille}</b> ➔ <b>{arriveeVille}</b> ({distanceKm} km • ~{dureeMinutes} min)
            </span>
          </div>

          {/* Boutons d'action Google Maps & GPS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Bouton d'entrée officiel dans Google Maps */}
            <a
              href={googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
              title="Ouvrir l'itinéraire complet de conduite dans Google Maps"
            >
              <Button
                variant="accent"
                size="sm"
                icon={<Navigation size={14} />}
                style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                Itinéraire Google Maps <ExternalLink size={12} />
              </Button>
            </a>

            {/* Bouton pour capter le vrai GPS du smartphone/PC */}
            <Button
              variant="outline"
              size="sm"
              loading={gpsLoading}
              onClick={handleCaptureRealGps}
              icon={<Crosshair size={14} />}
              title="Utiliser la géolocalisation réelle de votre appareil"
            >
              {deviceGps ? 'GPS connecté' : 'Mon GPS réel'}
            </Button>

            {/* Contrôle simulation */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSimulating(!isSimulating)}
              icon={isSimulating ? <Pause size={14} /> : <Play size={14} />}
              title={isSimulating ? 'Mettre en pause le mouvement' : 'Animer le camion le long du trajet'}
            >
              {isSimulating ? 'Pause' : 'Animer'}
            </Button>

            {/* Sélecteur de mode de carte */}
            <div
              style={{
                display: 'inline-flex',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                overflow: 'hidden',
                backgroundColor: '#FFFFFF',
              }}
            >
              <button
                type="button"
                onClick={() => setMapMode('osm')}
                style={{
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: mapMode === 'osm' ? 'var(--color-primary)' : 'transparent',
                  color: mapMode === 'osm' ? '#FFFFFF' : 'var(--color-text)',
                  fontWeight: mapMode === 'osm' ? 700 : 500,
                }}
              >
                Plan
              </button>
              <button
                type="button"
                onClick={() => setMapMode('satellite')}
                style={{
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: mapMode === 'satellite' ? 'var(--color-primary)' : 'transparent',
                  color: mapMode === 'satellite' ? '#FFFFFF' : 'var(--color-text)',
                  fontWeight: mapMode === 'satellite' ? 700 : 500,
                }}
              >
                Satellite
              </button>
              <button
                type="button"
                onClick={() => setMapMode('google')}
                style={{
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: mapMode === 'google' ? '#EA4335' : 'transparent',
                  color: mapMode === 'google' ? '#FFFFFF' : 'var(--color-text)',
                  fontWeight: mapMode === 'google' ? 700 : 500,
                }}
                title="Vue interactive Google Maps intégrée"
              >
                Google Maps
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message d'erreur GPS le cas échéant */}
      {gpsError && (
        <div style={{ padding: '0.4rem 1rem', backgroundColor: '#FDF2E9', color: '#B94A48', fontSize: '0.8rem', borderBottom: '1px solid #F5C6CB' }}>
          ⚠️ {gpsError}
        </div>
      )}

      {/* Affichage de la carte : soit Leaflet (Plan / Satellite), soit Iframe Google Maps */}
      <div style={{ position: 'relative', width: '100%', height }}>
        {mapMode === 'google' ? (
          <iframe
            title={`Itinéraire Google Maps ${departVille} vers ${arriveeVille}`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={getGoogleMapsEmbedUrl(departVille, arriveeVille)}
          />
        ) : (
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
        )}

        {/* Badge d'information en bas de carte */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            zIndex: 400,
            backgroundColor: 'rgba(255, 255, 255, 0.94)',
            padding: '0.45rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Compass size={14} color="#123B2A" />
          <span>
            {deviceGps ? (
              <>
                Position GPS réelle : <b>{deviceGps.lat.toFixed(4)}°N, {deviceGps.lng.toFixed(4)}°W</b>
              </>
            ) : (
              <>
                Tracé routier Casamance (N4/N6) • Camion : <b>{currentTruckPos[0].toFixed(4)}°N, {currentTruckPos[1].toFixed(4)}°W</b>
              </>
            )}
          </span>
          <a
            href={googleMapsPointUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#E88945', fontWeight: 700, textDecoration: 'underline', marginLeft: '4px' }}
          >
            Google Maps ↗
          </a>
        </div>
      </div>
    </div>
  );
};
