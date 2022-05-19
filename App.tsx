/*
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public 
License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later 
version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied 
warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see 
<https://www.gnu.org/licenses/>.
*/

import { StatusBar } from "expo-status-bar";
import { FC, useEffect, useState } from "react";
import { Overview } from "./Overview";
import { StyleSheet, View } from "react-native";
import { Station } from "./Station";
import { StationData } from "./StationData";
import { ReferenceData } from "./ReferenceData";
import { SourceOoeGvMock } from "./SourceOoeGvMock";
import { Source } from "./Source";
import { Utils } from "./Utils";
import { SourceOoeGv } from "./SourceOoeGv";
import { Page } from "./Page";

const App: FC<{}> = ({}) => {
    const [sources] = useState<Source[]>([new SourceOoeGv()]);
    const [reference, setReference] = useState<ReferenceData | undefined>();
    const [references, setReferences] = useState<ReferenceData[]>([]);
    const [station, setStation] = useState<StationData | undefined>();
    const [timerId, setTimerId] = useState<any>();
    const [color, setColor] = useState<string>("white");
    const [backgroundColor, setBackgroundColor] = useState<string>("darkslateblue");
    const [page, setPage] = useState<Page>("station");

    useEffect(() => {
        setReference(new ReferenceData(undefined, "Strobl", undefined, undefined));

        Promise.all(sources.map((source) => source.getReferences()))
            .then((multipleReferences) => multipleReferences.flatMap((r) => r))
            .then((references) =>
                references.sort(
                    (a, b) =>
                        a.stationName?.localeCompare(b?.stationName ?? "") ||
                        a.stationSite?.localeCompare(b?.stationSite ?? "") ||
                        0
                )
            )
            .then((references) => setReferences(references));
    }, []);

    useEffect(() => {
        if (station) {
            Utils.debug("Updating station data");

            const delay: number = Math.max(station.nextRefreshAtTime - Date.now(), 1000 * 10);

            setTimerId(
                setTimeout(() => {
                    setReference(
                        new ReferenceData(station.name, station.site, station.sourceName, station.mostRecentTemperature)
                    );
                }, delay)
            );
        }
    }, [station]);

    useEffect(() => {
        if (reference) {
            const source: Source | undefined = sources.find((source) => source.name === reference.sourceName);

            if (source) {
                source
                    .getStationData(reference.stationName, reference.stationSite)
                    .then((stationData) => setStation(stationData));
            } else {
                Promise.all(
                    sources.map((source) => source.getStationData(reference.stationName, reference.stationSite))
                ).then((stationDatas) => {
                    for (const stationData of stationDatas) {
                        if (!stationData.error) {
                            setStation(stationData);
                            return;
                        }
                    }

                    setStation(stationDatas[0]);
                });
            }
        }
    }, [reference]);

    useEffect(() => {
        return () => clearTimeout(timerId);
    }, [timerId]);

    useEffect(() => {
        switch (page) {
            case "station":
                break;

            case "overview":
                break;
        }
    }, [page]);

    const selectStation = (reference: ReferenceData) => {
        setReference(reference);
        setPage("station");
    };

    return (
        <View style={[styles.container, { backgroundColor }]}>
            {page === "overview" && (
                <View style={[styles.overview]}>
                    {<Overview references={references} select={selectStation}></Overview>}
                </View>
            )}

            {page === "station" && station && (
                <View style={styles.station}>
                    <Station
                        station={station}
                        action={() => setPage("overview")}
                        color={color}
                        backgroundColor={backgroundColor}
                    ></Station>
                </View>
            )}

            <StatusBar style="auto" backgroundColor={backgroundColor} />
        </View>
    );
};

export default App;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    overview: {
        position: "absolute",
        height: "100%",
        width: "100%",
        alignItems: "flex-start",
        justifyContent: "flex-start",
    },

    station: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});
