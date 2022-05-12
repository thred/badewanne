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

interface Props {
    temperature: number;
    color?: string;
    textColor?: string;
}

interface State {
    targetTemperature: number;
    currentTemperature: number;
}

export const Thermometer: FC<Props> = ({ temperature, color = "black", textColor = "white" }) => {
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
                    <Rect x="136" y="16" width="48" height="288" rx="24" ry="24" />
                </ClipPath>
            </Defs>

            <G>
                <Path
                    d="m158.09 0c-18.491 0-33.819 13.699-37.33 32h-8.7598c-2.216 0-4 1.784-4 4s1.784 4 4 
                    4h8v26h-6c-1.108 0-2 0.892-2 2s0.892 2 2 2h6v26h-8c-2.216 0-4 1.784-4 4s1.784 4 4 
                    4h8v26h-6c-1.108 0-2 0.892-2 2s0.892 2 2 2h6v26h-8c-2.216 0-4 1.784-4 4s1.784 4 4 
                    4h8v26h-6c-1.108 0-2 0.892-2 2s0.892 2 2 2h6v8.2031a64 64 0 0 0-24 49.797 64 64 0 
                    0 0 55.785 63.412c2.0543 0.35728 4.151 0.58789 6.3047 0.58789h1.9102 1.9102c2.1536 
                    0 4.2504-0.23061 6.3047-0.58789a64 64 0 0 0 55.785-63.412 64 64 0 0 0-24-49.941v-8.0586h6c1.108 
                    0 2-0.892 2-2s-0.892-2-2-2h-6v-26h8c2.216 0 4-1.784 4-4s-1.784-4-4-4h-8v-26h6c1.108 0 
                    2-0.892 2-2s-0.892-2-2-2h-6v-26h8c2.216 0 4-1.784 4-4s-1.784-4-4-4h-8v-26h6c1.108 0 
                    2-0.892 2-2s-0.892-2-2-2h-6v-26h8c2.216 0 4-1.784 
                    4-4s-1.784-4-4-4h-8.7598c-3.5106-18.301-18.839-32-37.33-32h-3.8203zm1.9102 8c1.0293 
                    0 2.0433 0.058102 3.0469 0.15234 0.3397 0.031831 0.67134 0.086624 1.0078 0.12891 
                    0.66069 0.083187 1.3177 0.1762 1.9648 0.29883 0.38075 0.071988 0.75509 0.15887 
                    1.1309 0.24414 0.58464 0.13297 1.1627 0.27895 1.7344 0.44336 0.40441 0.11599 
                    0.80554 0.23592 1.2031 0.36719 0.53049 0.1756 1.0508 0.37008 1.5684 0.57227 
                    0.38815 0.15121 0.77767 0.29717 1.1582 0.46289 0.50397 0.2201 0.99259 0.466 
                    1.4824 0.71094 1.1599 0.5783 2.2896 1.2063 3.3633 1.916 0.53243 0.35192 
                    1.0376 0.73682 1.5469 1.1191 0.22452 0.16906 0.45595 0.32909 0.67578 0.50391
                    0.51693 0.40978 1.0118 0.84275 1.502 1.2832 0.17778 0.16027 0.35713 0.31823 
                    0.53125 0.48242 0.509 0.47848 0.99992 0.97362 1.4766 1.4844 0.11783 0.12666 
                    0.23187 0.2562 0.34765 0.38477 0.51351 0.56843 1.0104 1.1493 1.4824 1.7539 2.6603 
                    3.4079 4.6293 7.3683 5.7363 11.691 0.65547 2.5597 1.041 5.2303 1.041 8v26 4 26 8 26 
                    4 26 8 26 4 12.062a56 56 0 0 1 24 45.938 56 56 0 0 1-49.084 55.236c-0.88652 0.19407-1.7903
                     0.33768-2.7031 0.45703-0.01779 0.00233-0.03494 0.00747-0.05273 0.00976-0.00383 5e-4 
                     -0.0079-4.9e-4 -0.01172 0-1.3607 0.1751-2.7386 0.29688-4.1484 
                     0.29688s-2.7877-0.12178-4.1484-0.29688c-0.00384-4.9e-4 -0.00787 5e-4 -0.01172 
                     0a56 56 0 0 1-0.05273-0.00976c-0.91284-0.11935-1.8166-0.26296-2.7031-0.45703a56 
                     56 0 0 1-49.084-55.236 56 56 0 0 1 24-45.818v-12.182-4-26-8-26-4-26-8-26-4-26c0-2.7697 
                     0.38555-5.4403 1.041-8 1.107-4.3231 3.076-8.2835 5.7363-11.691 0.47198-0.6046 
                     0.96892-1.1855 1.4824-1.7539 0.11578-0.12857 0.22982-0.25811 0.34765-0.38477 
                     0.47664-0.51075 0.96756-1.0059 1.4766-1.4844 0.17412-0.16419 0.35347-0.32216 
                     0.53125-0.48242 0.49011-0.44045 0.98503-0.87342 1.502-1.2832 0.21983-0.17482 
                     0.45126-0.33484 0.67578-0.50391 0.50932-0.38232 1.0144-0.76722 1.5469-1.1191 
                     1.0737-0.7097 2.2034-1.3377 3.3633-1.916 0.48983-0.24494 0.97846-0.49084 
                     1.4824-0.71094 0.38053-0.16572 0.77005-0.31168 1.1582-0.46289 0.51754-0.20218 
                     1.0379-0.39666 1.5684-0.57227 0.39758-0.13127 0.79871-0.2512 1.2031-0.36719 0.57171-0.16441 
                     1.1497-0.31038 1.7344-0.44336 0.37577-0.085266 0.75011-0.17215 1.1309-0.24414 
                     0.64715-0.12263 1.3042-0.21564 1.9648-0.29883 0.33647-0.042282 0.66811-0.097076 
                     1.0078-0.12891 1.0036-0.094242 2.0176-0.15234 3.0469-0.15234zm0 200a48 
                     48 0 0 0-48 48 48 48 0 0 0 48 48 48 48 0 0 0 48-48 48 48 0 0 0-48-48z"
                    fill={color}
                />
                <G fill={color} fontFamily="sans-serif" fontSize="16px">
                    <Text x="216" y="42">
                        30
                    </Text>

                    <Text x="216" y="106">
                        20
                    </Text>

                    <Text x="216" y="170">
                        10
                    </Text>

                    <Text x="104" y="170" textAnchor="end">
                        10
                    </Text>

                    <Text x="104" y="106" textAnchor="end">
                        20
                    </Text>

                    <Text x="104" y="42" textAnchor="end">
                        30
                    </Text>
                </G>

                <Rect
                    x="136"
                    y={228 - currentTemperature * 6.4}
                    rx="24"
                    ry="4"
                    fill={color}
                    width="48"
                    height={currentTemperature * 6.4}
                    clipPath="url(#clip)"
                />

                <Text x="160" y="267" fill={textColor} fontFamily="sans-serif" fontSize="40px" textAnchor="middle">
                    {currentTemperature.toFixed(1)}
                </Text>
            </G>
        </Svg>
    );
};
