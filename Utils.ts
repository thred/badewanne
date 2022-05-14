export class Utils {
    static error(message: string, ...optionalParams: any[]): void {
        console.error(`${new Date().toISOString()} | ${message}`, ...optionalParams);
    }

    static warn(message: string, ...optionalParams: any[]): void {
        console.warn(`${new Date().toISOString()} | ${message}`, ...optionalParams);
    }

    static info(message: string, ...optionalParams: any[]): void {
        console.info(`${new Date().toISOString()} | ${message}`, ...optionalParams);
    }

    static debug(message: string, ...optionalParams: any[]): void {
        console.debug(`${new Date().toISOString()} | ${message}`, ...optionalParams);
    }
}
