import { z } from 'zod';

export const errorLogSchema = z.object({
    error: z.string().max(1000),
    stack: z.string().optional().nullable(),
    url: z.string().url().optional(),
    pathname: z.string().max(500),
    search: z.string().max(1000).optional(),
    hash: z.string().max(100).optional(),
    buildVersion: z.string().max(50),
    userAgent: z.string().max(500),
    ip: z.string().max(45).optional(),
    screenSize: z.string().max(50),
    language: z.string().max(20),
    system: z.object({
        os: z.string().max(50),
        version: z.string().max(50),
        browser: z.string().max(50),
        browserVersion: z.string().max(50),
        memory: z.object({
            total: z.string().max(50),
            free: z.string().max(50),
        }),
    }),
    retryCount: z.number().int().min(0),
    context: z.object({
        windowWidth: z.number().int().min(0),
        windowHeight: z.number().int().min(0),
        timeZone: z.string().max(100),
        darkMode: z.boolean(),
    }).optional(),
});

export function validateErrorLog(data: unknown) {
    return errorLogSchema.safeParse(data);
}