export class ReferenceData {
    get key(): string {
        return `${this.stationName};${this.stationSite};${this.sourceName}`;
    }

    constructor(
        readonly stationName: string | undefined,
        readonly stationSite: string | undefined,
        readonly sourceName: string | undefined,
        readonly temperature: number | undefined
    ) {}
}
