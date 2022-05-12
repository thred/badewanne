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

export class Listeners<AnyParams extends any[] = []> {
    private readonly listeners: ((...args: AnyParams) => void)[] = [];

    get empty(): boolean {
        return !this.listeners.length;
    }

    bind(listener: (...args: AnyParams) => void): void {
        console.log(`${new Date()} Binding listener ...`);

        this.listeners.push(listener);
    }

    unbind(listener: (...args: AnyParams) => void): void {
        const index: number = this.listeners.indexOf(listener);

        if (index >= 0) {
            console.log(`${new Date()} Unbinding listener ...`);

            this.listeners.splice(index, 1);
        }
    }

    promise(): Promise<AnyParams[0]> {
        return new Promise((resolve) => {
            this.bind((...args) => resolve(args[0]));
        });
    }

    fire(...args: AnyParams): void {
        console.log(`${new Date()} Notifying ${this.listeners.length} listeners ...`);

        for (const listener of this.listeners) {
            listener(...args);
        }
    }

    clear(): void {
        this.listeners.length = 0;
    }
}
