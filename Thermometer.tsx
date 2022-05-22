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

import { FC, SetStateAction, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import Svg, { Defs, ClipPath, Rect, Path, Text, G, TSpan } from "react-native-svg";

export const Thermometer: FC<{
    temperature: number;
    color?: string;
    textColor?: string;
}> = ({ temperature, color = "black", textColor = "white" }) => {
    const [targetTemperature, setTargetTemperature] = useState(0);
    const [currentTemperature, setCurrentTemperature] = useState(0);
    const temperatureAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (temperature !== targetTemperature) {
            setTargetTemperature(temperature);

            Animated.timing(temperatureAnim, {
                toValue: temperature,
                duration: 2000,
                useNativeDriver: false,
            }).start();
        }
    });

    temperatureAnim.addListener((state) => setCurrentTemperature(state.value));

    return (
        <Svg width="320" height="320" viewBox="0 0 320 320">
            <Defs>
                <ClipPath id="clip">
                    <Rect x="152" y="16" width="16" height="272" rx="8" ry="8" />
                </ClipPath>
            </Defs>

            <Rect
                x="152"
                y={219 - currentTemperature * 6.4}
                width="16"
                height={currentTemperature * 6.4}
                rx="8"
                ry="2"
                fill={color}
                clipPath="url(#clip)"
            />

            <Path
                d="m160 0c-13.296 0-24 10.704-24 24h-4c-2.216 0-4 1.784-4 4s1.784 4 4 4h4v26h-3c-1.108 0-2 0.892-2 2s0.892 2 2 2h3v26h-4c-2.216 0-4 1.784-4 4s1.784 4 4 4h4v26h-3c-1.108 0-2 0.892-2 2s0.892 2 2 2h3v26h-4c-2.216 0-4 1.784-4 4s1.784 4 4 4h4v26h-3c-1.108 0-2 0.892-2 2s0.892 2 2 2h3v6.8184a64 64 0 0 0-40 59.182 64 64 0 0 0 64 64 64 64 0 0 0 64-64 64 64 0 0 0-40-59.318v-6.6816h3c1.108 0 2-0.892 2-2s-0.892-2-2-2h-3v-26h4c2.216 0 4-1.784 4-4s-1.784-4-4-4h-4v-26h3c1.108 0 2-0.892 2-2s-0.892-2-2-2h-3v-26h4c2.216 0 4-1.784 4-4s-1.784-4-4-4h-4v-26h3c1.108 0 2-0.892 2-2s-0.892-2-2-2h-3v-26h4c2.216 0 4-1.784 4-4s-1.784-4-4-4h-4c0-13.296-10.704-24-24-24zm0 8c8.864 0 16 7.136 16 16v4 64 64 46.342a56 56 0 0 1 40 53.658 56 56 0 0 1-56 56 56 56 0 0 1-56-56 56 56 0 0 1 40-53.648v-46.352-64-64-4c0-8.864 7.136-16 16-16zm0 200a48 48 0 0 0-48 48 48 48 0 0 0 48 48 48 48 0 0 0 48-48 48 48 0 0 0-48-48z"
                fill={color}
            />

            <G fill={color} fontFamily="sans-serif" fontSize="16px">
                <Text x="194" y="34">
                    30
                </Text>

                <Text x="194" y="98">
                    20
                </Text>

                <Text x="194" y="162">
                    10
                </Text>

                <Text x="126" y="162" textAnchor="end">
                    10
                </Text>

                <Text x="126" y="98" textAnchor="end">
                    20
                </Text>

                <Text x="126" y="34" textAnchor="end">
                    30
                </Text>
            </G>

            <Text x="160" y="268" fill={textColor} fontFamily="sans-serif" fontSize="40px" textAnchor="middle">
                {currentTemperature.toFixed(1)}
            </Text>
        </Svg>
    );
};
