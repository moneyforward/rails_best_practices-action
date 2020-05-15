/// <reference types="node" />
import stream from 'stream';
import { CommandConstructor, SpawnPrguments } from '@moneyforward/command';
import StaticCodeAnalyzer from '@moneyforward/sca-action-core';
export declare type Result = {
    filename: string;
    line_number: string;
    message: string;
}[];
export default class Analyzer extends StaticCodeAnalyzer {
    private static readonly command;
    private static buildOutputFileOptions;
    constructor(options?: string[]);
    protected prepare(): Promise<void>;
    protected createTransformStreams(): stream.Transform[];
    protected get Command(): CommandConstructor;
    protected pipeline(stdout: stream.Readable | null, writable: stream.Writable, ...[, args]: SpawnPrguments): Promise<[stream.Readable, ...stream.Writable[]]>;
}
