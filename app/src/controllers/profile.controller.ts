import type { Request, Response} from 'express';

export const viewProfile = async (req: Request, res: Response) => {
    const { user } = req.user.id;
    
    
}