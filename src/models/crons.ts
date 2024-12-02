import mongoose from 'mongoose';
  const cronSchema = new mongoose.Schema({
    isOnce :{
      type :Boolean
    },
    to:{
      type :String,
      required :true
    },
    from:{
      type :String,
      required :true
    },
    message :{
      type :String,
      required :true
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
