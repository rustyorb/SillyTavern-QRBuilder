/**
 * Import a member from a URL-based module, bypassing webpack bundling.
 * Per official ST extension docs: https://docs.sillytavern.app/for-contributors/writing-extensions/
 *
 * @param {string} url    URL to import from
 * @param {string} what   Named export to pull
 * @param {any} fallback  Fallback value if import fails
 * @returns {Promise<any>}
 */
export async function importFromUrl(url, what, fallback = null) {
    try {
        const module = await import(/* webpackIgnore: true */ url);
        if (!Object.hasOwn(module, what)) throw new Error(`No '${what}' in ${url}`);
        return module[what];
    } catch (err) {
        console.error(`[QRBuilder] Failed to import '${what}' from ${url}:`, err);
        return fallback;
    }
}
