import { Request, Response } from "express";
import { getPluginById } from "../dbservices/plugin";



export const getPluginDetails = async (req: Request, res: Response) => {

    try {
        const id = req.params.id
       const data = await getPluginById(id)
        return res.status(200).json({ success: true, data:  data  })
    } catch (err: any) {
        console.log(err.response)
        res.status(400).json({
            message: 'Some Error on  Server',
            data: { errMessage: err?.message },
        });

    }
}