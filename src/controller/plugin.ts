import { Request, Response } from "express";
import { getPluginById } from "../dbservices/plugin";
import { getUserDetailsByProxyId } from "../dbservices/user";
import axios from "axios";
import _ from 'lodash';




export const getPluginDetails = async (req: Request, res: Response) => {

    try {
        const id = req.params.id
        const data = await getPluginById(id)
        return res.status(200).json({ success: true, data: data })
    } catch (err: any) {
        console.log(err.response)
        res.status(400).json({
            message: 'Some Error on  Server',
            data: { errMessage: err?.message },
        });

    }
}

export const perfromAction = async (req: Request, res: Response) => {

    try {
        // const actionId = req.params.actionId;
        // const appId = req.params.appId;
        // const userId = req.body.userId
        // const payload = req.body.payload
        // const plugData = await getPluginById(appId)
        // const userDetails = await getUserDetailsByProxyId(userId)
        // const userContext = (userDetails?.appList.find((data) => (data.pluginData as any)?._id.toString() == appId))?.userData
        // const actionPayload = JSON.parse(plugData?.action || "")?.[actionId]
        // const { url, method } = actionPayload;
        // Object.keys(actionPayload.userPayload).forEach((payloadPath) => {
        //     const userDataPath = actionPayload.userPayload[payloadPath];
        //     _.set(payload, payloadPath, _.get(userContext, userDataPath))
        // })
        // const config = {
        //     method: method,
        //     url: url,
        //     ...(method !== 'GET' && { data: payload })
        // };
        // const response = (await axios(config))?.data;

        return res.status(200).json({ success: true, data: "response" })
    } catch (err: any) {
        console.log(err.response)
        res.status(400).json({
            message: 'Some Error on  Server',
            data: { errMessage: err?.message },
        });

    }
}