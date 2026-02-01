/**
 * Prefix a path with the base path for GitHub Pages deployment (or other subpath deployments).
 * Uses NEXT_PUBLIC_BASE_PATH env variable if defined.
 * 
 * @param {string} path - The path to prefix (e.g., '/images/logo.png')
 * @returns {string} - The prefixed path (e.g., '/hungrybird/images/logo.png')
 */
export const prefixPath = (path) => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    // Remove leading slash if it exists to avoid double slash if basePath ends with slash (though usually it doesn't)
    // Actually, usually basePath is "/hungrybird" and path is "/logo.png". 
    // We simply concatenate.
    return `${basePath}${path}`;
};
