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

import { FC } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Linking } from "react-native";
import { StationData } from "./StationData";
import { Thermometer } from "./Thermometer";
import { Utils } from "./Utils";

export const Station: FC<{
    station: StationData;
    action: () => void;
    color: string;
    backgroundColor: string;
}> = ({ station, action, color = "white", backgroundColor = "darkslateblue" }) => {
    const openSourceUrl = () => {
        const sourceUrl: string | undefined = station.source.link;

        if (sourceUrl) {
            Linking.canOpenURL(sourceUrl).then((supported) => {
                if (supported) {
                    Linking.openURL(sourceUrl);
                }
            });
        }
    };

    return (
        <View style={[styles.station, { backgroundColor }]}>
            <View style={styles.center}>
                <TouchableOpacity onPress={action}>
                    <Thermometer
                        temperature={station.mostRecentSample?.temperature ?? 0}
                        color={color}
                        textColor={backgroundColor}
                    ></Thermometer>
                </TouchableOpacity>

                <TouchableOpacity onPress={action}>
                    <View style={styles.location}>
                        {station && (
                            <Text style={[styles.text, { color }]}>
                                {station.name}, {station.site}
                            </Text>
                        )}

                        {station.mostRecentSample?.date && (
                            <Text style={[styles.text, { color }]}>
                                {Utils.passedSince(station.mostRecentSample?.date)}
                            </Text>
                        )}

                        {station.error && <Text style={styles.text}>{station.error}</Text>}
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity onPress={openSourceUrl}>
                    <Text style={[styles.text, { color }, styles.transparent]}>{station.source.disclaimer}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    station: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
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
        alignItems: "center",
        justifyContent: "center",
    },

    text: {
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
