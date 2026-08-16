export interface SessionLike {
    id?: unknown;
    title?: unknown;
    events?: unknown;
}
export interface AgentLike {
    id?: unknown;
    session?: SessionLike;
    status?: unknown;
}
export declare function readSessionTitle(session: SessionLike | undefined): string | undefined;
export declare function readAssistantSnippet(session: SessionLike | undefined, maxChars: number): string;
export declare function agentKey(agent: {
    id?: unknown;
} | undefined): string;
export declare function isPrimarySessionId(id: string): boolean;
export declare function isRootAgent(ctx: {
    get(name: string): unknown;
}, agent: {
    id?: unknown;
} | undefined): boolean;
export declare function isSubAgent(ctx: {
    get(name: string): unknown;
}, agent: {
    id?: unknown;
} | undefined): boolean;
export declare function seedAgentStatuses(ctx: {
    get(name: string): unknown;
}): Map<string, string>;
export declare function isGoalAutoContinuing(ctx: {
    get(name: string): unknown;
}, agent: unknown): boolean;
