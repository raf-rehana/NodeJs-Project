const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const environment = {
  production: !isLocal,
  apiUrl: isLocal ? 'http://localhost:4000/api' : 'https://angular-project-2o3k.onrender.com/api',
  backendUrl: isLocal ? 'http://localhost:4000' : 'https://angular-project-2o3k.onrender.com'
};