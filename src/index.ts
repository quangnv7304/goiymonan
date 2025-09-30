import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { initPrisma } from './prismaClient';
import recommendationRouter from './routes/recommendationRoutes';
import feedbackRouter from './routes/feedbackRoutes';
import recipeRouter from './routes/recipeRoutes';

dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true
}));
app.use(bodyParser.json());

// ✅ Middleware log request
app.use((req, _res, next) => {
  console.log(`📥 ${req.method} ${req.url}`, req.body || {});
  next();
});

app.get('/', (_req, res) => res.send('Chào mừng đến với API nhóm 5'));

app.use('/recommendations', recommendationRouter); // Đề xuất món ăn
app.use('/feedback', feedbackRouter);
app.use('/recipes', recipeRouter);

const PORT = process.env.PORT || 3000;

async function main() {
  await initPrisma();
  app.listen(PORT, () => console.log(`🚀 Backend (TS) listening on ${PORT}`));
}
main().catch(err => {
  console.error('❌ Failed to start app', err);
  process.exit(1);
});
