import dotenv from 'dotenv';
dotenv.config();
import 'newrelic';
import express, { Request, Response } from 'express';
import chat from './route/chat';
import utility from './route/utility';
import cors from 'cors'; // Import the cors middleware
import { connectDB } from './models';
import webhook from './route/webhook';
import plugin from './route/plugin';
import thread from './route/thread';
import user from './route/user';
import bodyParser from 'body-parser';
import errorHandler from './middleware/error-handler';
import agent from './route/agent';
import resource from './route/resource';
import responseTime from 'response-time';
import * as amplitude from '@amplitude/analytics-node';
import env from './config/env';
import logger from './service/logger';
amplitude.init(env.AMPLITUDE_API_KEY || "");
const app = express();
const port = process.env.PORT || 3000;
connectDB();

app.use(cors({
  origin: "*",
  maxAge: 86400,
  preflightContinue: true,
}));
app.use(bodyParser.json({ limit: '8mb' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/plugin', plugin);
app.use('/chat', chat);
app.use('/utility', utility);
app.use('/webhook', webhook);
app.use('/thread', thread);
app.use('/user', user);
app.use('/agent', agent);
app.use('/resource', resource);

// Define a route
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to AI Assistant!');
});

app.use(errorHandler as any);
// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});



