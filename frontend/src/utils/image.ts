
// Helper for image URL
export const getFullImageUrl = (path: string | undefined) => {
    if (!path) return '';

    // If path is already a full URL
    if (path.startsWith('http')) {
        return path;
    }

    if (path.startsWith('data:')) return path;

    // Relative path handling
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    
    // Try VITE_CDN_URL first
    const cdnUrl = import.meta.env.VITE_CDN_URL;
    if (cdnUrl) {
        return `${cdnUrl.replace(/\/$/, '')}/${cleanPath}`;
    }
    
    // Fallback to API URL
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const baseUrl = apiUrl.replace(/\/api\/?$/, '');
    return `${baseUrl}/${cleanPath}`;
};
