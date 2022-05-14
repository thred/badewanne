/*
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public 
License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later 
version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied 
warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see 
<https://www.gnu.org/licenses/>.

Copyright 2022, Manfred Hantschel
*/

import { Listeners } from "./Listeners";
import { Source } from "./Source";
import { Utils } from "./Utils";

export type SampleData = {
    date: Date;
    temperature: number;
};

export class StationData {
    get id(): string {
        return `${this.name};${this.source.name}`;
    }

    private _samples: SampleData[] = [];

    get samples(): SampleData[] {
        this.ensureNotDirty();

        return this._samples;
    }

    get mostRecentSample(): SampleData | undefined {
        this.ensureNotDirty();

        return this._samples[0];
    }

    dirty: boolean = true;

    constructor(readonly name: string, readonly source: Source) {}

    addSample(...samples: SampleData[]): this {
        for (const sample of samples) {
            sample.date.setUTCMilliseconds(0);

            const existingSample: SampleData | undefined = this.findSampleByDate(sample.date);

            if (existingSample) {
                existingSample.date = sample.date;
                existingSample.temperature = sample.temperature;
            } else {
                this._samples.push(sample);
                this.dirty = true;
            }
        }

        return this;
    }

    findSampleByDate(date: Date): SampleData | undefined {
        return this._samples.find((sample) => sample.date.valueOf() == date.valueOf());
    }

    private ensureNotDirty(): void {
        if (this.dirty) {
            this._samples.sort((a, b) => b.date.valueOf() - a.date.valueOf());
        }
    }
}

export class SourceData {
    readonly stations: StationData[] = [];

    addStation(...stations: StationData[]): this {
        for (const station of stations) {
            const existingStation: StationData | undefined = this.findStationById(station.id);

            if (existingStation) {
                existingStation.addSample(...station.samples);
            } else {
                this.stations.push(station);
            }
        }

        return this;
    }

    findStationById(id?: string): StationData | undefined {
        return this.stations.find((station) => station.id === id);
    }

    findStationByName(name?: string): StationData | undefined {
        return this.stations.find((station) => station.name === name);
    }
}

export class Data extends SourceData {
    constructor(readonly sources: Source[]) {
        super();
    }

    readonly listeners: Listeners<[]> = new Listeners();

    refreshing: boolean = false;
    alive: boolean = true;
    timeoutId: number = 0;

    get error(): string {
        return this.sources
            .filter((source) => source.error)
            .map((source) => source.error)
            .join("\n");
    }

    async refreshAll(force: boolean = false): Promise<void> {
        const promises: Promise<number>[] = [];

        if (!this.alive || this.refreshing) {
            return;
        }

        this.refreshing = true;

        let nextUpdateIn: number = 1000 * 60;

        try {
            for (const source of this.sources) {
                Utils.debug(`Refreshing source "${source.name}" ...`);

                source.error = undefined;

                promises.push(
                    source.refresh(this, force).then(
                        (nextUpdate) => nextUpdate,
                        (error) => {
                            Utils.warn(`Refreshing source "${source.name}" failed: ${error}`);

                            source.error = `${error}`;

                            return Date.now() + 1000 * 60;
                        }
                    )
                );
            }

            const nextUpdate: number = (await Promise.all(promises)).reduce(
                (a, b) => Math.min(a, b),
                Date.now() + 1000 * 60 * 5
            );

            nextUpdateIn = Math.max(nextUpdate - Date.now(), 1000);
        } catch (error) {
            Utils.error(`Unexpected error`, error);
        } finally {
            this.refreshing = false;
            this.listeners.fire();
        }

        Utils.debug(`Next refresh in ${nextUpdateIn / 1000} seconds.`);

        const currentTimeoutId: number = ++this.timeoutId;

        setTimeout(() => {
            if (this.timeoutId !== currentTimeoutId) {
                return;
            }

            this.refreshAll();
        }, nextUpdateIn);
    }
}
