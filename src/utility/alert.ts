import axios from "axios";

export const sendAlert = async (payload :any ) => {
    if (process.env.NODE_ENV === 'local') return;
    axios
    .post("https://flow.sokt.io/func/scriOEGFG332", { message: payload })
    .catch((error) => {
      console.error("Error occurred while sending request:", error);
    });
  
  };