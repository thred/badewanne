import React, { FC } from "react";
import {
    TouchableOpacity,
    StyleSheet,
    View,
    Text,
    FlatList,
    SafeAreaView,
    StatusBar,
    ListRenderItem,
} from "react-native";
import { Reference } from "./Reference";
import { ReferenceData } from "./ReferenceData";

export const Overview: FC<{
    references: ReferenceData[];
    select: (reference: ReferenceData) => void;
}> = ({ references, select }) => {
    const renderReference: ListRenderItem<ReferenceData> = ({ item }) => (
        <TouchableOpacity onPress={() => select(item)}>
            <Reference reference={item} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.component}>
            <FlatList data={references} renderItem={renderReference} keyExtractor={(reference) => reference.key} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    component: {
        flex: 1,
        width: "100%",
        marginTop: StatusBar.currentHeight ?? 0,
    },

    text: {},
});
