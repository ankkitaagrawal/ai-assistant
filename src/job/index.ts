import dotenv from "dotenv";
dotenv.config();
import redis from '../config/redis'
const args = require('args-parser')(process.argv);
import { ragSyncJob } from './data_source';

const JOBS = new Map<string, Function>();
JOBS.set('rag-sync', ragSyncJob);

const jobName = args?.job;

const job = JOBS.get(jobName);
if (job) {
    job();
}

