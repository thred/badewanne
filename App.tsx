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
import { FC, useEffect, useRef, useState } from "react";
import { Overview } from "./Overview";
import { AppState, BackHandler, Image, Text, StyleSheet, View, TouchableOpacity } from "react-native";
import { Station } from "./Station";
import { StationData } from "./StationData";
import { ReferenceData } from "./ReferenceData";
import { SourceOoeGvMock } from "./SourceOoeGvMock";
import { Source } from "./Source";
import { Utils } from "./Utils";
import { SourceOoeGv } from "./SourceOoeGv";
import { Page } from "./Page";
import { Style } from "./Style";
import AsyncStorage from "@react-native-async-storage/async-storage";

const storageKey: string = "@badewanne:reference";

const App: FC<{}> = ({}) => {
    const [sources] = useState<Source[]>([new SourceOoeGvMock()]);
    const [reference, setReference] = useState<ReferenceData | undefined>();
    const [references, setReferences] = useState<ReferenceData[]>([]);
    const [station, setStation] = useState<StationData | undefined>();
    const [timerId, setTimerId] = useState<any>();

    // Hey React, come on. In order to trigger a fresh, do I really have to set a random number?
    // I'm really amazed how React can be that successful.
    const [refreshedAtTime, setRefreshedAtTime] = useState<number>(Date.now());

    const [page, _setPage] = useState<Page>("station");
    const pageRef = useRef<Page>(page);
    // Hey React, come on. Do I really have to create a Ref, implement it on my own, just to access the current value
    // within an event handler? And if I don't do this, I don't get an error - the thing just does not work?
    // I'm really amazed how React can be that successful.
    const setPage: (page: Page) => unknown = (page) => {
        pageRef.current = page;
        _setPage(page);
    };

    const appState = useRef(AppState.currentState);
    const [appStateVisible, setAppStateVisible] = useState(appState.current);

    useEffect(() => {
        AsyncStorage.getItem(storageKey).then(
            (value) => {
                console.log(value);
                if (value) {
                    try {
                        setReference(JSON.parse(value));
                    } catch (error) {
                        Utils.warn("Failed to set state", error);
                    }
                } else {
                    setReference(new ReferenceData(undefined, "Strobl", undefined, undefined));
                }
            },
            (error) => {
                Utils.warn("Failed to read state", error);
                setReference(new ReferenceData(undefined, "Strobl", undefined, undefined));
            }
        );

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
        const backAction = () => {
            if (pageRef.current === "station") {
                return false;
            }

            setPage("station");
            return true;
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

        return () => backHandler.remove();
    }, []);

    useEffect(() => {
        const subscription = AppState.addEventListener("change", (nextAppState) => {
            if (appState.current.match(/inactive|background/) && nextAppState === "active") {
                setRefreshedAtTime(Date.now());
            }

            appState.current = nextAppState;
            setAppStateVisible(appState.current);
        });

        return () => {
            subscription.remove();
        };
    }, []);

    useEffect(() => {
        if (station) {
            Utils.debug("Updating station data");

            const delay: number = Math.max(station.nextRefreshAtTime - Date.now(), 1000 * 10);

            setTimerId(
                setTimeout(() => {
                    setRefreshedAtTime(Date.now());
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

            try {
                AsyncStorage.setItem(storageKey, JSON.stringify(reference));
            } catch (error) {
                Utils.warn("Failed to persist state", error);
            }
        }
    }, [reference, refreshedAtTime]);

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
        <View style={styles.container}>
            <View style={styles.header}>
                {page === "station" && (
                    <TouchableOpacity onPress={() => setPage("overview")}>
                        <Image source={require("./assets/menu-icon.png")} style={styles.icon}></Image>
                    </TouchableOpacity>
                )}

                {page === "overview" && (
                    <TouchableOpacity onPress={() => setPage("station")}>
                        <Image source={require("./assets/back-icon.png")} style={styles.icon}></Image>
                    </TouchableOpacity>
                )}

                <Text style={{ flexGrow: 1 }}></Text>

                {page === "station" && (
                    <TouchableOpacity onPress={() => setRefreshedAtTime(Date.now())}>
                        <Image source={require("./assets/refresh-icon.png")} style={styles.icon}></Image>
                    </TouchableOpacity>
                )}

                {/* <Image source={require("./assets/info-icon.png")} style={styles.icon}></Image>

                <Image source={require("./assets/exit-icon.png")} style={styles.icon}></Image> */}
            </View>

            <View style={styles.content}>
                {page === "overview" && <Overview references={references} select={selectStation}></Overview>}

                {page === "station" && station && (
                    <Station station={station} action={() => setPage("overview")}></Station>
                )}
            </View>

            <StatusBar translucent={false} style="auto" backgroundColor={Style.backgroundColor} />
        </View>
    );
};

export default App;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Style.backgroundColor,
        alignItems: "center",
        justifyContent: "center",
    },

    header: {
        flexGrow: 0,
        flexShrink: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },

    icon: {
        width: 32,
        height: 32,
        margin: 2,
    },

    content: {
        flexGrow: 1,
        flexShrink: 0,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
});
