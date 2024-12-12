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
import axios from 'axios';
import { convert } from 'html-to-text'
import { queryLangchain, saveVectorsToPinecone } from './service/langchain'
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

// Define a route
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to AI Assistant!');
});
app.use(errorHandler as any);
// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

app.post('/storevector', async (req: Request, res: Response) => {
  try {
    const data = await getCrawledDataFromSite(req.body.url);
    res.status(200).json({ message: "Working Done!", data: data })
  } catch (error) {
    console.error('Error while crawling data:', error);
    res.status(400).json({ message: "Not Working!" })
  }
})

app.post('/query', async (req: Request, res: Response) => {
  try {
    const data = await queryLangchain(req.body.prompt, req.body.namespace);
    res.status(200).json({ message: "Working Done!", data: data })
  } catch (error) {
    console.error('Did not get the result from AI:', error);
    res.status(400).json({ message: "Not Working!" })
  }
})

const getCrawledDataFromSite = async (url: string) => {
  try {
    const response = await axios.get(url);
    const textContent = convert(response.data)
    const storedVectors = await saveVectorsToPinecone('1234', textContent, 'assistant');
    return { storedVectors };
  } catch (error) {
    console.error('Error fetching the webpage:', error);
    throw error;
  }
}