import { Resolver, StaticCodeAnalyzer, Transformers } from '@moneyforward/sca-action-core';
export declare type Result = {
    filename: string;
    line_number: string;
    message: string;
}[];
export default class Analyzer extends StaticCodeAnalyzer {
    private static readonly command;
    constructor(options?: string[]);
    protected prepare(): Promise<unknown>;
    protected createTransformStreams(): Transformers;
    protected execute(args: string[], changeRanges: Map<string, [number, number][]>, resolver: Resolver): Promise<number>;
}
