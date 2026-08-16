import { z } from 'zod';
import { type TrayState } from './notify/tray-state.ts';
export declare const completedItemSchema: z.ZodObject<{
    sessionId: z.ZodString;
    title: z.ZodString;
}, z.core.$strip>;
export declare const trayStateSchema: z.ZodObject<{
    pending: z.ZodNumber;
    completed: z.ZodArray<z.ZodObject<{
        sessionId: z.ZodString;
        title: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const notifyDomainSpec: {
    readonly name: "dsh_notify";
    readonly version: 1;
    readonly global: {
        readonly schema: z.ZodObject<{
            pending: z.ZodNumber;
            completed: z.ZodArray<z.ZodObject<{
                sessionId: z.ZodString;
                title: z.ZodString;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        readonly initial: TrayState;
    };
    readonly tables: {
        readonly completed: {
            readonly valueSchema: z.ZodObject<{
                sessionId: z.ZodString;
                title: z.ZodString;
            }, z.core.$strip>;
        };
    };
};
export declare function isEmptyTrayState(state: TrayState): boolean;
export declare function parseTrayState(raw: unknown): TrayState;
