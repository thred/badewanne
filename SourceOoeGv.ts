import { ReferenceData } from "./ReferenceData";
import { SampleData } from "./SampleData";
import { Source } from "./Source";
import { StationData } from "./StationData";
import { Utils } from "./Utils";

const url: string = "https://data.ooe.gv.at/files/hydro/HDOOE_Export_WT.zrxp";

export class SourceOoeGv extends Source {
    private refreshedAtTime: number = Date.now();
    private nextRefreshAtTime: number = Date.now();
    private stationDatas?: Promise<StationData[]>;
    private error?: string;
    private loading: boolean = false;

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

    getReferences(): Promise<ReferenceData[]> {
        return this.getStationDatas().then((stationDatas) =>
            stationDatas.map(
                (stationData) =>
                    new ReferenceData(
                        stationData.name,
                        stationData.site,
                        stationData.sourceName,
                        stationData.mostRecentSample?.temperature
                    )
            )
        );
    }

    getStationData(name?: string, site?: string): Promise<StationData> {
        return this.getStationDatas().then(
            (stationDatas) =>
                stationDatas.find((s) => s.name === name && s.site === site) ??
                stationDatas.find((s) => s.name === name) ??
                stationDatas.find((s) => s.site === site) ??
                new StationData(
                    name ?? "Unbekannt",
                    site ?? "Unbekannt",
                    this,
                    [],
                    this.nextRefreshAtTime,
                    this.error ?? "Station nicht gefunden."
                )
        );
    }

    protected async getStationDatas(): Promise<StationData[]> {
        if (Date.now() < this.nextRefreshAtTime && this.stationDatas) {
            return this.stationDatas;
        }

        this.refreshedAtTime = Date.now();
        this.nextRefreshAtTime = Date.now() + this.interval;
        this.error = undefined;

        this.stationDatas = new Promise(async (resolve) => {
            try {
                let binary: string = await this.fetchData();

                resolve(this.parse(binary));
            } catch (error) {
                this.error = `${error}`;

                resolve([]);
            }
        });

        return this.stationDatas;
    }

    protected async fetchData(): Promise<string> {
        Utils.info(`Fetching ${url} ...`);

        const response: Response = await fetch(url);

        return await response.text();
    }

    protected parse(binary: string): StationData[] {
        const stationBinaries: string[] = binary
            .split("#ZRXPVERSION")
            .map((s) => s.trim())
            .filter((s) => s.length);

        return stationBinaries
            .map((stationBinary) => this.parseStation(stationBinary))
            .filter((station) => station) as StationData[];
    }

    protected parseStation(stationBinary: string): StationData | undefined {
        const columns: string[] = stationBinary.split("|");

        let waterColumn: string | undefined = columns.find((column) => column.startsWith("SWATER"));

        if (!waterColumn) {
            Utils.warn(`SWATER is missing in: ${stationBinary.substring(0, 512)} ...`);

            waterColumn = "SWATER";
        }

        const siteColumn: string | undefined = columns.find((column) => column.startsWith("SNAME"));

        if (!siteColumn) {
            Utils.warn(`SNAME is missing in: ${stationBinary.substring(0, 512)} ...`);
            return undefined;
        }

        const water: string = waterColumn.substring("SWATER".length);
        const site: string = siteColumn.substring("SNAME".length);
        const samples: SampleData[] = [];
        const temperatureColumn: string | undefined = columns.find((column) => column.match(/\d{14}\s\d/)?.length);

        if (!temperatureColumn) {
            //Utils.warn(`Temperatures are missing in: ${stationBinary.substring(0, 512)} ...`);
        } else {
            const lines: string[] = temperatureColumn
                .split(/\n/)
                .map((s) => s.trim())
                .filter((s) => s.length);

            for (const line of lines) {
                const token: string[] = line.split(" ");

                if (token.length !== 2 || token[0].length !== 14) {
                    Utils.warn(`Invalid line: ${line}`);
                    continue;
                }

                const date: Date = new Date();

                date.setUTCFullYear(parseInt(token[0].substring(0, 4)));
                date.setUTCMonth(parseInt(token[0].substring(4, 6)) - 1);
                date.setUTCDate(parseInt(token[0].substring(6, 8)));
                date.setUTCHours(parseInt(token[0].substring(8, 10)));
                date.setUTCMinutes(parseInt(token[0].substring(10, 12)));
                date.setUTCSeconds(parseInt(token[0].substring(12, 14)));

                // According to the documentation, it's MEZ+1 (no daylight saving)
                date.setTime(date.getTime() - 1000 * 60 * 60);

                const temperature: number = parseFloat(token[1]);

                if (!isNaN(temperature) && temperature > -20 && temperature < 100) {
                    samples.push({ date, temperature });
                }
            }
        }

        return new StationData(water, site, this, samples, this.nextRefreshAtTime, undefined);
    }
}
