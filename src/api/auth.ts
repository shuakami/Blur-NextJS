// pages/api/auth.ts
import {getAuth} from "@clerk/nextjs/server";
import type {NextApiRequest, NextApiResponse} from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const auth = getAuth(req);
    const {userId} = auth;

    if (!userId) {
        return res.status(401).json({error: "Unauthorized"});
    }

    const token = await auth.getToken();

    res.status(200).json({token});
}