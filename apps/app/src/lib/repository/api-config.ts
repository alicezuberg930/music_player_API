import { Platform } from 'react-native';

const DEVELOPMENT_API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api/v1'
    : 'http://localhost:5000/api/v1';

const PRODUCTION_API_BASE_URL =
  'https://yukikaze-music-api.onrender.com/api/v1';

const API_BASE_URL = __DEV__
  ? DEVELOPMENT_API_BASE_URL
  : PRODUCTION_API_BASE_URL;

export { API_BASE_URL, DEVELOPMENT_API_BASE_URL, PRODUCTION_API_BASE_URL };
