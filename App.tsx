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
import React, { FC, useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Data, StationData } from "./Data";
import { state, State } from "./State";
import { Station } from "./Station";

interface Props {}

const App: FC<Props> = ({}) => {
    const context = useContext<State>(state);
    const [station, setStation] = useState<StationData>();
    const [error, setError] = useState<string>();

    const refresh = () => {
        if (context.data.error) {
            setStation(undefined);
            setError(context.data.error);
            return;
        }

        let currentStation: StationData | undefined = context.data.findById(context.stationId);

        if (!currentStation) {
            currentStation = context.data.findByName(context.stationName);
        }

        if (!currentStation) {
            setStation(undefined);
            setError(`Daten von Station ${context.stationName} fehlen.`);
            return;
        }

        context.stationId = currentStation.id;
        context.stationName = currentStation.name;

        console.log(`${new Date()} Using station ${context.stationId} ...`);

        setError(undefined);
        setStation(currentStation);
    };

    useEffect(() => {
        context.data.listeners.bind(() => refresh());
        context.data.schedule();

        return () => context.data.listeners.clear();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: context.backgroundColor }]}>
            <Station station={station} error={error}></Station>
            <StatusBar style="auto" />
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
});
function AppContext<T>(AppContext: any) {
    throw new Error("Function not implemented.");
}
