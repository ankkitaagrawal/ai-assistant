import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import chat from './route/chat';
import utility from './route/utility';
import cors from 'cors'; // Import the cors middleware
import { connectDB } from './models';
import webhook from './route/webhook';
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
connectDB();

// Middleware to parse JSON
app.use(express.json());

// Enable CORS
app.use(cors());

app.use('/chat', chat);
app.use('/utility', utility);
app.use('/webhook', webhook);

// Define a route
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to AI Assistant!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
