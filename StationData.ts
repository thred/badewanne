import { SampleData } from "./SampleData";
import { Source } from "./Source";

export class StationData {
    get sourceName(): string {
        return this.source.name;
    }

    readonly refreshedAtDate: Date = new Date();

    readonly samples: SampleData[];

    get mostRecentSample(): SampleData | undefined {
        return this.samples[0];
    }

    get mostRecentTemperature(): number | undefined {
        return this.mostRecentSample?.temperature;
    }

    constructor(
        readonly name: string,
        readonly site: string,
        readonly source: Source,
        samples: SampleData[],
        readonly nextRefreshAtTime: number,
        readonly error?: string
    ) {
        this.samples = samples.sort((a, b) => b.date.valueOf() - a.date.valueOf());
    }
}
