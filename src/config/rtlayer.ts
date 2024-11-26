import RTLayer from 'rtlayer-node';
const apiKey = process.env.RTLAYER_API_KEY || "";
const rtlayer = new RTLayer(apiKey);

export default rtlayer;