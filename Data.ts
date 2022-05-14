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

import { MockedData } from "./MockedData";
import { Listeners } from "./Listeners";

const url: string = "https://data.ooe.gv.at/files/hydro/HDOOE_Export_WT.zrxp";

export type SampleData = {
    date: Date;
    temperature: number;
};

export class StationData {
    static parse(stationBinary: string): StationData | undefined {
        const columns: string[] = stationBinary.split("|");

        const idColumn: string | undefined = columns.find((column) => column.startsWith("SOURCEID"));

        if (!idColumn) {
            console.log(`SOURCEID is missing in: ${stationBinary.substring(0, 512)} ...`);
            return undefined;
        }

        const nameColumn: string | undefined = columns.find((column) => column.startsWith("SNAME"));

        if (!nameColumn) {
            console.log(`SNAME is missing in: ${stationBinary.substring(0, 512)} ...`);
            return undefined;
        }

        let waterColumn: string | undefined = columns.find((column) => column.startsWith("SWATER"));

        if (!waterColumn) {
            console.log(`SWATER is missing in: ${stationBinary.substring(0, 512)} ...`);

            waterColumn = "SWATER";
        }

        const station: StationData = new StationData(
            idColumn.substring("SOURCEID".length),
            nameColumn.substring("SNAME".length),
            waterColumn.substring("SWATER".length)
        );

        const temperatureColumn: string | undefined = columns.find((column) => column.match(/\d{14}\s\d/)?.length);

        if (!temperatureColumn) {
            console.log(`Temperatures are missing in: ${stationBinary.substring(0, 512)} ...`);
            return station;
        }

        const lines: string[] = temperatureColumn
            .split(/\n/)
            .map((s) => s.trim())
            .filter((s) => s.length);

        for (const line of lines) {
            const samples: string[] = line.split(" ");

            if (samples.length !== 2 || samples[0].length !== 14) {
                console.log(`Invalid line: ${line}`);
                continue;
            }

            const date: Date = new Date();

            date.setUTCFullYear(parseInt(samples[0].substring(0, 4)));
            date.setUTCMonth(parseInt(samples[0].substring(4, 6)) - 1);
            date.setUTCDate(parseInt(samples[0].substring(6, 8)));
            date.setUTCHours(parseInt(samples[0].substring(8, 10)));
            date.setUTCMinutes(parseInt(samples[0].substring(10, 12)));
            date.setUTCSeconds(parseInt(samples[0].substring(12, 14)));

            const temperature: number = parseFloat(samples[1]);

            station.samples.push({ date, temperature });
        }

        station.samples.sort((a, b) => b.date.valueOf() - a.date.valueOf());

        return station;
    }

    private samples: SampleData[] = [];

    get mostRecentSample(): SampleData | undefined {
        return this.samples[0];
    }

    constructor(readonly id: string, readonly name: string, readonly water: string) {}
}

export class Data {
    readonly listeners: Listeners<[]> = new Listeners();
    readonly stations: StationData[] = [];

    refreshing: boolean = false;
    scheduled: boolean = false;

    constructor(readonly liveData: boolean = true) {}

    get ready(): boolean {
        return !this.error && !!this.stations.length;
    }

    error: string | undefined = undefined;

    schedule(): void {
        this.refresh().then(() => {
            if (this.scheduled) {
                return;
            }

            this.scheduled = true;

            setTimeout(
                () => {
                    this.scheduled = false;
                    this.schedule();
                },
                this.liveData ? 1000 * 60 * 5 : 1000 * 10
            );
        });
    }

    async refresh(): Promise<void> {
        if (this.refreshing) {
            return;
        }

        this.refreshing = true;

        console.log(`${new Date()} Refreshing ...`);

        try {
            let binary: string;

            if (this.liveData) {
                const response: Response = await fetch(url);

                binary = await response.text();
            } else {
                binary = await MockedData.promise();
            }

            this.error = undefined;
            this.parse(binary);

            if (!this.liveData) {
                for (const station of this.stations) {
                    if (station.mostRecentSample) {
                        station.mostRecentSample.temperature = 8 + Math.random() * 20;

                        console.log(
                            `${station.name}, ${station.water}: ${station.mostRecentSample.temperature.toFixed(1)}`
                        );
                    }
                }
            }
        } catch (error) {
            console.log(`${new Date()} ${error}`);
            this.error = `${error}`;
        } finally {
            this.refreshing = false;
            this.listeners.fire();
        }
    }

    parse(binary: string): void {
        const stationBinaries: string[] = binary
            .split("#ZRXPVERSION")
            .map((s) => s.trim())
            .filter((s) => s.length);

        this.stations.length = 0;

        for (const stationBinary of stationBinaries) {
            const station: StationData | undefined = StationData.parse(stationBinary);

            if (station) {
                this.stations.push(station);
            }
        }
    }

    findById(id?: string): StationData | undefined {
        return this.stations.find((station) => id === station.id);
    }

    findByName(name?: string): StationData | undefined {
        return this.stations.find((station) => name === station.name);
    }
}
