import type { Request, Response, NextFunction} from 'express';
import { getCharacterData } from '../services/profile-contoller.service.js';

export const viewProfileController = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user?.id;

    if(!user) return res.status(404).json({
        message: "User not found!",
        success: false
    })
    
    try {

        const data = await getCharacterData(user);

        if(!data) return res.status(401).json({
            message: "Request Invalid, user id must be real and exist",
            success: false
        })

        return res.status(200).json({
            message: "Data retrieve successfully",
            success: true,
            data: data
        })

    } catch (err) {
        next(err);
    }
}