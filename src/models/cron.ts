import mongoose from 'mongoose';
  const cronSchema = new mongoose.Schema({
    isOnce :{
      type :Boolean
    },
    userId:{
      type :String
    },
    message :{
      type :String
    },
    meta: Object, 
    createdAt: {
      type: Date,
      default: Date.now,
    },
    cronExpression :{
      type:String
    },
    cronJobId :{
      type:String
    },
    id :{
      type :String
    },
    timezone :{
      type :String
    },
    updatedAt :{
    type: Date,
    default: Date.now,
  },
  }, { minimize: false });


const CronModel = mongoose.model('cron', cronSchema);
export default CronModel;
