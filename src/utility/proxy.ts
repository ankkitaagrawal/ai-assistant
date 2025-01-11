import env from "../config/env";

const axios = require('axios');

export type ProxyUser = {
    id: number,
    name: string,
    mobile: string,
    email: string,
    is_block: boolean,
}
export const getProxyUser = async (proxyUid: string): Promise<ProxyUser> => {
    const axios = require('axios');

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://routes.msg91.com/api/870623b1736406370677f756255301/getDetails?user_id=${proxyUid}`,
        headers: {
            'Authkey': env.PROXY_API_KEY
        }
    };

    const { data: responseData, status, statusCode } = await axios.request(config);
    return responseData?.data?.data[0];

}
