declare var process: any;

/**
 * Will detect if the current environment is production or development.
 * This is intended for disabling debugging utilities in production and should in no case
 * ever be used to change logic in development mode.
 */
export function isProductionEnvironment() {
    // Will be written into the bundle by webpack.
    if (!process || !process.env) {
        return false;
    }
    return process.env.NODE_ENV === "production";
}
