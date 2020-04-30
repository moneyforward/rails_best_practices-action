import fs from 'fs';
import os from 'os';
import path from 'path';
import stream from 'stream';
import util from 'util';
import { Resolver, StaticCodeAnalyzer, Transformers, tool } from '@moneyforward/sca-action-core';

const debug = util.debuglog('rails_best_practices-action');

export type Result = {
  filename: string;
  line_number: string;
  message: string;
}[];

export default class Analyzer extends StaticCodeAnalyzer {
  private static readonly command = 'rails_best_practices';

  constructor(options: string[] = []) {
    super(Analyzer.command, options.concat(['-f', 'json', '--silent']), undefined, 2, undefined, 'Rails Best Practices');
  }

  protected async prepare(): Promise<unknown> {
    return tool.installGem(true, Analyzer.command);
  }

  protected createTransformStreams(): Transformers {
    const buffers: Buffer[] = [];
    const next = new stream.Transform({
      readableObjectMode: true,
      transform: function (buffer, _encoding, done): void {
        buffers.push(buffer);
        done();
      },
      flush: function (done): void {
        const result: Result = JSON.parse(Buffer.concat(buffers).toString());
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
    });
    return [new stream.PassThrough(), next];
  }

  protected async execute(args: string[], changeRanges: Map<string, [number, number][]>, resolver: Resolver): Promise<number> {
    const directory = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'rails_best_practices-'));
    const file = path.join(directory, 'output.json');
    await fs.promises.writeFile(file, null);
    const [prev, next = prev] = this.createTransformStreams();
    const that = Object.assign({}, this, { createTransformStreams: () => [prev, next] });
    const watcher = fs.watch(file).on('error', debug).once('change', (eventType, filename) => {
      debug('%s %s', eventType, filename);
      watcher.close();
      fs.createReadStream(file).pipe(next);
    });
    return super.execute.call(that, ['--output-file', file].concat(args), changeRanges, resolver);
  }
}
