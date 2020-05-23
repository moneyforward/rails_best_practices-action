import { expect } from 'chai';
import stream from 'stream';
import { reporter } from '@moneyforward/code-review-action'
import Analyzer, { Result } from '../src'
import { AssertionError } from 'assert';

type ReporterConstractor = reporter.ReporterConstructor;

describe('Transform', () => {
  it('should return the problem object', async () => {
    const expected = {
      file: 'foo/bar.rb',
      line: '1',
      column: undefined,
      severity: 'error',
      message: 'remove trailing whitespace',
      code: undefined
    };
    const result: Result = [
      {
        filename: 'foo/bar.rb',
        'line_number': '1',
        message: 'remove trailing whitespace'
      }
    ];
    const text = JSON.stringify(result);
    const analyzer = new (class extends Analyzer {
      get Reporter(): reporter.ReporterConstructor {
        throw new Error("Method not implemented.");
      }
      public constructor() {
        super();
      }
      public createTransformStreams(): stream.Transform[] {
        return super.createTransformStreams();
      }
    })();
    const [prev, next = prev] = analyzer.createTransformStreams();
    stream.Readable.from(text).pipe(prev).pipe(next);
    for await (const problem of next) {
      expect(problem).to.deep.equal(expected);
      return;
    }
    throw new AssertionError({ message: 'There was no problem to expect.', expected });
  });
});
