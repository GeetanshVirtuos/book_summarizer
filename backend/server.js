import express from 'express';
import cors from 'cors';
import summaryRouter from "./routes/summarize.js";
import authRouter from "./routes/auth.js";
import { logger, LOG_TYPES } from './utility/logger.js';

const app = express();
const port = 3000;

app.use(express.static('public'))
app.use(express.json());

// Add CORS for "http://localhost:5173"
app.use(cors({
    origin: "http://localhost:5173"
    // origin: "http://127.0.0.1:3002"
}));

//API Endpoints
app.get('/', (req, res) => {
  res.send('Hello World! Welcome to the book Summarizer backend.')
})

app.use('/summarize', summaryRouter);
app.use('/auth', authRouter);

app.listen(port, () => {
    logger(`Server started and listening on port ${port}`, LOG_TYPES.SUCCESS);
})







