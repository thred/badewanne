import { Data } from "./Data";

export abstract class Source {
    private nextRefresh: number = Date.now();

    error: string | undefined;

    abstract get name(): string;

    abstract get disclaimer(): string;

    abstract get link(): string;

    abstract get interval(): number;

    async refresh(data: Data, force: boolean = false): Promise<number> {
        const now: number = Date.now();

        if (now > this.nextRefresh || force) {
            this.nextRefresh = now + this.interval;

            await this.load(data);
        }

        return this.nextRefresh;
    }

    protected abstract load(data: Data): Promise<void>;
}
