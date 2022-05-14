import { Data, SourceData, StationData } from "./Data";
import { Source } from "./Source";
import { Utils } from "./Utils";

const url: string = "https://data.ooe.gv.at/files/hydro/HDOOE_Export_WT.zrxp";

export class SourceOoeGv extends Source {
    get name(): string {
        return "Hydrographischer Dienst Oberösterreich";
    }
    get disclaimer(): string {
        return "Datenquelle: Land Oberösterreich - data.ooe.gv.at";
    }
    get link(): string {
        return "https://www.land-oberoesterreich.gv.at/142236.htm";
    }

    get interval(): number {
        return 1000 * 60 * 5;
    }

    protected async load(data: Data): Promise<void> {
        let binary: string = await this.fetchData();

        this.parse(data, binary);
    }

    protected async fetchData(): Promise<string> {
        const response: Response = await fetch(url);

        return await response.text();
    }

    protected parse(data: Data, binary: string): void {
        const stationBinaries: string[] = binary
            .split("#ZRXPVERSION")
            .map((s) => s.trim())
            .filter((s) => s.length);

        for (const stationBinary of stationBinaries) {
            const station: StationData | undefined = this.parseStation(stationBinary);

            if (station) {
                data.addStation(station);
            }
        }
    }

    protected parseStation(stationBinary: string): StationData | undefined {
        const columns: string[] = stationBinary.split("|");

        const nameColumn: string | undefined = columns.find((column) => column.startsWith("SNAME"));

        if (!nameColumn) {
            Utils.warn(`SNAME is missing in: ${stationBinary.substring(0, 512)} ...`);
            return undefined;
        }

        let waterColumn: string | undefined = columns.find((column) => column.startsWith("SWATER"));

        if (!waterColumn) {
            Utils.warn(`SWATER is missing in: ${stationBinary.substring(0, 512)} ...`);

            waterColumn = "SWATER";
        }

        const name: string = nameColumn.substring("SNAME".length);
        const water: string = waterColumn.substring("SWATER".length);

        const station: StationData = new StationData(`${water}, ${name}`, this);

        const temperatureColumn: string | undefined = columns.find((column) => column.match(/\d{14}\s\d/)?.length);

        if (!temperatureColumn) {
            Utils.warn(`Temperatures are missing in: ${stationBinary.substring(0, 512)} ...`);
            return station;
        }

        const lines: string[] = temperatureColumn
            .split(/\n/)
            .map((s) => s.trim())
            .filter((s) => s.length);

        for (const line of lines) {
            const samples: string[] = line.split(" ");

            if (samples.length !== 2 || samples[0].length !== 14) {
                Utils.warn(`Invalid line: ${line}`);
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

            station.addSample({ date, temperature });
        }

        return station;
    }
}
