import userModel from "../models/users";


export async function getUserDetailsByProxyId(id: String) {
   return await userModel.findOne({ proxyId: id }).populate('appList.pluginData').lean();
}

export async function createUser(user: { proxyId: string, channelId: string, [key: string]: any }) {
   const result = await userModel.create({
      ...user,
      appList: [{ pluginData: "674b0066d7097c29597410f6", userData: { id: user.proxyId } }]
   });
   // Step 2: Populate the appList.pluginData field
   const populatedUser = await result.populate('appList.pluginData');
   return populatedUser.toObject();
}


export async function updatePrompt({ userId, prompt }: { userId: string, prompt: string }) {
   return await userModel.findOneAndUpdate({ channelId: userId }, {
      $set: { prompt: prompt }
   }, { new: true }).lean();
}

export async function updateUserAgent({ userId, agentId }: { userId: string, agentId: string }) {
   return await userModel.findByIdAndUpdate(userId, {
      $set: { agent: agentId }
   }, { new: true }).lean();
}


export async function getUserByChannelId({ channelId }: { channelId: string }) {
   return await userModel.findOne({ channelId: channelId }).lean();
}
export async function addThreadInUserHistory(id: String) {
   // return await userModel.findOne({proxyId:id})
}

export async function updateUserService({ userId, model, service }: { userId: string, model: string, service: string }) {
   return await userModel.findOneAndUpdate({ _id: userId }, {
      $set: { aiModel: model, aiService: service }
   }, { new: true }).lean();
}

