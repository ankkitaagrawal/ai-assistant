import threadModel from "../models/thread";


export async function createOrFindThread(userId1: string, userId2: string): Promise<string> {
  const users = [userId1, userId2].sort();

  let thread = await threadModel.findOne({
    users: { $all: users }
  });
  if (!thread) {
    thread = await threadModel.create({ users });
  }

  return thread._id.toString();
}


export async function findThreadsByUser(userId: string): Promise<any[]> {
  const threads = await threadModel.find({
    users: userId,
  });

  return threads;
}