import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../../../lib/auth.js";
import type { Response, Request, NextFunction } from "express";

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers)});

    if(!session) return res.status(401).json({ error: "Unauthorized", success: false });

    req.user = session.user;
    next();
}