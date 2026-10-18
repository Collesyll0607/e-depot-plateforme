import { ApiClient } from './client';
import { demoApiClient } from './demo/demoApi';
import { HttpApiClient } from './http';

// Par défaut, l'application est en mode HTTP connecté au backend réel Spring Boot + PostgreSQL
const mode = import.meta.env.VITE_API_MODE || 'http';

export const api: ApiClient = mode === 'demo' ? demoApiClient : new HttpApiClient();

export * from './client';
