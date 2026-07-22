/**
 * Central environment resolver for the test framework.
 *
 * Selects a target environment via the ENV variable (default: "local").
 * Each environment defines where the frontend (UI) and API live. In CI
 * the defaults point at the servers Playwright boots via `webServer`.
 *
 * Override any value from the shell or Jenkins, e.g.:
 *   ENV=qa BASE_URL=https://qa.novastore.example npm run test:smoke
 */

export type EnvName = 'local' | 'dev' | 'qa' | 'prod';

export interface EnvConfig {
  name: EnvName;
  /** URL that serves frontend.html */
  baseURL: string;
  /** REST API base, e.g. http://localhost:4000/api */
  apiURL: string;
}

const ENV = (process.env.ENV || 'local').toLowerCase() as EnvName;

const CONFIGS: Record<EnvName, EnvConfig> = {
  local: {
    name: 'local',
    baseURL: 'http://127.0.0.1:8080',
    apiURL: 'http://127.0.0.1:4000/api',
  },
  dev: {
    name: 'dev',
    baseURL: process.env.BASE_URL || 'http://127.0.0.1:8080',
    apiURL: process.env.API_URL || 'http://127.0.0.1:4000/api',
  },
  qa: {
    name: 'qa',
    baseURL: process.env.BASE_URL || 'http://127.0.0.1:8080',
    apiURL: process.env.API_URL || 'http://127.0.0.1:4001/api',
  },
  prod: {
    name: 'prod',
    baseURL: process.env.BASE_URL || 'https://novastore.example',
    apiURL: process.env.API_URL || 'https://novastore.example/api',
  },
};

export const env: EnvConfig = {
  ...CONFIGS[ENV] ?? CONFIGS.local,
  // Allow direct overrides regardless of selected env.
  ...(process.env.BASE_URL ? { baseURL: process.env.BASE_URL } : {}),
  ...(process.env.API_URL ? { apiURL: process.env.API_URL } : {}),
};

/** Admin credentials the app seeds on first run. */
export const ADMIN = {
  email: process.env.ADMIN_EMAIL || 'admin@nova.com',
  password: process.env.ADMIN_PASSWORD || 'admin123',
};
