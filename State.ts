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

import { Context, createContext } from "react";
import { Data } from "./Data";

export interface State {
    data: Data;
    stationId?: string;
    stationName?: string;
    backgroundColor: string;
    foregroundColor: string;
}

export const state: Context<State> = createContext<State>({
    data: new Data(false),
    stationId: undefined,
    stationName: "Strobl",
    backgroundColor: "darkslateblue",
    foregroundColor: "white",
});
