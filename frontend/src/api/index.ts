import { ApiClient } from './client';
import { demoApiClient } from './demo/demoApi';
import { HttpApiClient } from './http';

// En déploiement statique (GitHub Pages), utilise demoApiClient par défaut
const mode = import.meta.env.VITE_API_MODE || 'demo';

export const api: ApiClient = mode === 'demo' ? demoApiClient : new HttpApiClient();

export * from './client';
