import CodeReviewAction from '@moneyforward/code-review-action';
import Analyzer from '.';

(async (): Promise<void> => {
  console.log('::echo::%s', process.env['RUNNER_DEBUG'] === '1' ? 'on' : 'off');
  try {
    process.exitCode = await new CodeReviewAction(Analyzer).execute();
  } catch (reason) {
    console.log('::error::%s', reason);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
})();
