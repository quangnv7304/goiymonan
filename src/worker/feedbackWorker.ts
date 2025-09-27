import feedbackQueue from '../queue/feedbackQueue';
import { sendFeedback } from '../services/rlService';

feedbackQueue.process('send-feedback', async (job: any) => {
  const { state, action, reward, nextState, done } = job.data;
  try {
    await sendFeedback({ state, action, reward, next_state: nextState, done });
    return Promise.resolve();
  } catch (err) {
    console.error('Error sending feedback to RL', err);
    throw err;
  }
});

console.log('Feedback worker started');
