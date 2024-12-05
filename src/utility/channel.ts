const axios = require('axios');
export const getUserIdByEmailId = async (userEmail :string)=>{
    const userName = userEmail.split('@')[0]
    const data = {
        terms: {
            type: ["U"],
            orgId: ["q957w6rtkdinckgbp8vv"],
            email : [
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

   const response = (await axios.post(`https://delve-api.intospace.io/search/prod-space?query=${userName}&API_KEY=${process.env.CHANNEL_AUTHKEY}&size=5`, data))?.data?.hits?.hits[0]?._source?.userId

    return response

}
export const getUser = async (uid :string)=>{
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

   const response = (await axios.post(`https://delve-api.intospace.io/search/prod-space?query=${uid}&API_KEY=${process.env.CHANNEL_AUTHKEY}&size=1`, data))?.data?.hits?.hits[0]?._source

    return response

}
