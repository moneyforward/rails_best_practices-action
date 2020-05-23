import { ChildProcess, SpawnOptions } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import stream from 'stream';
import util from 'util';
import { analyzer } from '@moneyforward/code-review-action';
import Command, { CommandConstructor, SpawnPrguments } from '@moneyforward/command';
import { transform } from '@moneyforward/stream-util';
import StaticCodeAnalyzer, { installer } from '@moneyforward/sca-action-core';

type AnalyzerConstructorParameter = analyzer.AnalyzerConstructorParameter;

const debug = util.debuglog('@moneyforward/code-review-action-rails_best_practices-plugin');

export type Result = {
  filename: string;
  line_number: string;
  message: string;
}[];

export default abstract class Analyzer extends StaticCodeAnalyzer {
  private static readonly command = 'rails_best_practices';

  private static buildOutputFileOptions(): string[] {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), `${Analyzer.command}-`));
    const file = path.join(directory, 'output.json');
    return ['--output-file', file];
  }

  constructor(...args: AnalyzerConstructorParameter[]) {
    super(Analyzer.command, args.map(String).concat(['-f', 'json', '--silent']), undefined, 2, undefined, 'Rails Best Practices');
  }

  protected async prepare(): Promise<void> {
    console.log(`::group::Installing gems...`);
    try {
      await new installer.RubyGemsInstaller(true).execute([Analyzer.command]);
    } finally {
      console.log(`::endgroup::`)
    }
  }

  protected createTransformStreams(): stream.Transform[] {
    return [
      new transform.JSON(),
      new stream.Transform({
        objectMode: true,
        transform: function (result: Result, encoding, done): void {
          debug(`Detected %d problem(s).`, result.length);
          for (const error of result) this.push({
            file: error.filename,
            line: error.line_number,
            column: undefined,
            severity: 'error',
            message: error.message,
            code: undefined
          });
          this.push(null);
          done();
        }
      })
    ];
  }

  protected get Command(): CommandConstructor {
    return class <T> extends Command<T> {
      constructor(
        command: string,
        args: readonly string[] = [],
        options: SpawnOptions = {},
        promisify?: (child: ChildProcess, ...spawnPrguments: SpawnPrguments) => Promise<T>,
        exitStatusThreshold: number | ((exitStatus: number) => boolean) = 1,
        argumentsSizeMargin = 0
      ) {
        super(command, args, options, promisify, exitStatusThreshold, argumentsSizeMargin + Analyzer.buildOutputFileOptions().map(Command.sizeOf).reduce((previous, current) => previous + current));
      }

      protected async configureArguments(args: string[]): Promise<string[]> {
        const [optionName, file] = Analyzer.buildOutputFileOptions();
        await fs.promises.writeFile(file, '');
        return this.args.concat(optionName, file, ...args);
      }
    }
  }

  protected pipeline(stdout: stream.Readable | null, writable: stream.Writable, ...[, args]: SpawnPrguments): Promise<[stream.Readable, ...stream.Writable[]]> {
    const [optionName, file] = args.slice(this.args.length);
    debug('%s %s', optionName, file);
    const transformers: stream.Writable[] = this.createTransformStreams() || []
    return new Promise((resolve, reject) => {
      const watcher = fs.watch(file).on('error', reject).once('change', (eventType, filename) => {
        const stat = fs.statSync(file);
        debug('%s %s (%d bytes)', eventType, filename, stat.size);
        watcher.close();
        resolve([fs.createReadStream(file), ...transformers.concat(writable)]);
      });
    });
  }
}
