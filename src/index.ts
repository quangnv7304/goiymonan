import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { initPrisma } from './prismaClient';
import recommendationRouter from './routes/recommendationRoutes';
import feedbackRouter from './routes/feedbackRoutes';
import './worker/feedbackWorker'; // start worker

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Chào mừng đến với API nhóm 5');
});


app.use('/recommendations', recommendationRouter);
app.use('/feedback', feedbackRouter);

const PORT = process.env.PORT || 3000;

async function main() {
  await initPrisma();
  app.listen(PORT, () => {
    console.log(`Backend (TS) listening on ${PORT}`);
  });
}

main().catch(err => {
  console.error('Failed to start app', err);
  process.exit(1);
});
