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

import { useContext, useState } from "react";
import { useEffect } from "react";
import { FC } from "react";
import { StyleSheet, View, Text, Button, TouchableOpacity, Linking } from "react-native";
import { Data, SampleData, StationData } from "./Data";
import { state, State } from "./State";
import { Thermometer } from "./Thermometer";

interface Props {
    station?: StationData;
    error?: string;
}

const foregroundColor: string = "white";
const backgroundColor: string = "darkslateblue";
const sourceUrl: string = "https://www.land-oberoesterreich.gv.at/142236.htm";

export const Station: FC<Props> = ({ station, error }) => {
    const context = useContext<State>(state);
    const [sample, setSample] = useState<SampleData>();
    const [modified, setModified] = useState<string>();

    const refresh = () => {
        context.data.refresh();
    };

    const openSourceUrl = () => {
        Linking.canOpenURL(sourceUrl).then((supported) => {
            if (supported) {
                Linking.openURL(sourceUrl);
            }
        });
    };

    useEffect(() => {
        const sample: SampleData | undefined = station?.mostRecentSample;

        setSample(sample);

        const day: string | undefined = undefined;

        if (sample) {
            const daysAgo: number = totalDay(new Date()) - totalDay(sample.date);
            const hour: string = formatNumber(sample.date.getHours());
            const minute: string = formatNumber(sample.date.getMinutes());

            if (daysAgo === 0) {
                setModified(`${hour}:${minute} Uhr`);
            } else if (daysAgo === 1) {
                setModified(`Gestern, ${hour}:${minute} Uhr`);
            } else {
                setModified(`${hour}:${minute} Uhr, vor ${daysAgo} Tagen`);
            }
        } else {
            setModified(undefined);
        }
    }, [station]);

    return (
        <View style={styles.station}>
            <View style={styles.center}>
                <TouchableOpacity onPress={refresh}>
                    <Thermometer
                        temperature={sample?.temperature ?? 0}
                        color={foregroundColor}
                        textColor={backgroundColor}
                    ></Thermometer>
                </TouchableOpacity>

                <View style={styles.location}>
                    {station && (
                        <Text style={styles.text}>
                            {station?.name}, {station?.water}
                        </Text>
                    )}

                    {modified && <Text style={[styles.text, styles.transparent]}>{modified}</Text>}

                    {error && <Text style={styles.text}>{error}</Text>}
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity onPress={openSourceUrl}>
                    <Text style={[styles.text, styles.transparent]}>
                        Datenquelle: Land Oberösterreich - data.ooe.gv.at
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    station: {
        color: foregroundColor,
        backgroundColor: backgroundColor,
    },

    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    location: {
        height: 100,
        alignItems: "center",
        justifyContent: "center",
    },

    footer: {
        justifyContent: "center",
    },

    text: {
        color: foregroundColor,
        paddingTop: 2,
        paddingBottom: 2,
    },

    transparent: {
        opacity: 0.5,
    },

    grow: {
        flex: 1,
    },
});

function formatNumber(n: number, length: number = 2): string {
    let s: string = n.toFixed(0);

    while (s.length < length) {
        s = "0" + s;
    }

    return s;
}

function totalDay(date: Date): number {
    return Math.floor((date.valueOf() - new Date(2020, 0, 0).valueOf()) / 1000 / 60 / 60 / 24);
}
