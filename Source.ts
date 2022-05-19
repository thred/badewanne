import { ReferenceData } from "./ReferenceData";
import { StationData } from "./StationData";

export abstract class Source {
    abstract get name(): string;

    abstract get disclaimer(): string;

    abstract get link(): string;

    abstract getReferences(): Promise<ReferenceData[]>;

    abstract getStationData(name?: string, site?: string): Promise<StationData>;
}
