import { FC } from "react";
import { View, Text, StyleSheet } from "react-native";
import { ReferenceData } from "./ReferenceData";
import { Style } from "./Style";

export const Reference: FC<{
    reference: ReferenceData;
}> = ({ reference }) => {
    return (
        <View style={styles.component}>
            <Text style={styles.name}>{reference.stationName}</Text>
            <Text style={styles.site}>{reference.stationSite}</Text>
            {reference.temperature !== undefined && (
                <Text style={styles.temperature}>{reference.temperature?.toFixed(1)}°C</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    component: {
        alignItems: "flex-start",
        justifyContent: "flex-start",
        paddingTop: 4,
        paddingBottom: 4,
        paddingLeft: 8,
        paddingRight: 8,
    },

    station: {
        flexGrow: 1,
        paddingLeft: 4,
    },

    name: {
        color: Style.color,
        fontSize: 24,
    },

    site: {
        color: Style.color,
    },

    temperature: {
        color: Style.color,
        opacity: 0.5,
    },
});
