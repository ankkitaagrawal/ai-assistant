const axios = require('axios');

interface ChannelUser {
    displayName: string;
    email: string;
    id: string;
    isEnabled: boolean;
    orgId: string;
    status: string;
    title: string;
    type: string;
    updatedAt: string;
    userId: string;
}

export const getUserByEmailId = async (userEmail: string): Promise<ChannelUser> => {
    const userName = userEmail.split('@')[0]
    const data = {
        terms: {
            type: ["U"],
            orgId: ["q957w6rtkdinckgbp8vv"],
            email: [
                userEmail
            ]
        },
        scoreMultiplier: {
            type: {
                values: ["U"],
                weight: 2
            },
            isEnabled: {
                values: [false],
                weight: 0
            },
            isArchived: {
                values: [true],
                weight: 0
            }
        }
    };
    const { data: responseData, status, statusCode } = await axios.post(`https://delve-api.intospace.io/search/prod-space?query=${userName}&API_KEY=${process.env.CHANNEL_AUTHKEY}&size=5`, data);
    // TODO : Handle status codes
    return responseData.hits?.hits[0]?._source;
}
export const getUser = async (uid: string) => {
    const data = {
        terms: {
            type: ["U"],
            orgId: ["q957w6rtkdinckgbp8vv"],
            userId: [
                uid
            ]
        },
        scoreMultiplier: {
            type: {
                values: ["U"],
                weight: 2
            },
            isEnabled: {
                values: [false],
                weight: 0
            },
            isArchived: {
                values: [true],
                weight: 0
            }
        }
    };

    const {data: responseData, status, statusCode} = await axios.post(`https://delve-api.intospace.io/search/prod-space?query=${uid}&API_KEY=${process.env.CHANNEL_AUTHKEY}&size=1`, data);
    // TODO: Handle status codes
    return responseData.hits?.hits[0]?._source;

}
