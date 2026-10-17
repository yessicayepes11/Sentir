// URL pública del backend (Render define RENDER_EXTERNAL_URL automáticamente)
const BASE_URL = String(process.env.PUBLIC_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:3001').replace(/\/+$/, '');

export default BASE_URL;
