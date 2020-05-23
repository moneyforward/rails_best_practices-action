import CodeReviewAction, { analyzer } from '@moneyforward/code-review-action';
import Analyzer from '.';

type AnalyzerConstructor = analyzer.AnalyzerConstructor;

(async (): Promise<void> => {
  console.log('::echo::%s', process.env['RUNNER_DEBUG'] === '1' ? 'on' : 'off');
  try {
    process.exitCode = await new CodeReviewAction(Analyzer as unknown as AnalyzerConstructor).execute();
  } catch (reason) {
    console.log('::error::%s', reason);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
})();
