import type { APIRoute, APIContext } from 'astro';

export const prerender = false;

interface D1Database {
    prepare(query: string): D1PreparedStatement;
}

interface D1PreparedStatement {
    bind(...values: any[]): D1PreparedStatement;
    first<T = unknown>(): Promise<T | null>;
    run(): Promise<D1Result>;
    all<T = unknown>(): Promise<D1Results<T>>;
}

interface D1Result {
    success: boolean;
    meta: any;
}

interface D1Results<T> {
    results: T[];
    success: boolean;
}

export const GET: APIRoute = async (context: APIContext) => {

    try {
        // Access DB from environment bindings
        const db = (context.locals as any).runtime?.env?.DB as D1Database;
        
        if (!db) {
            return new Response(JSON.stringify({ error: 'Database not available' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Fetch top 50 users by balance (since profit column might not exist or be reliable yet, based on admin.ts not using it)
        // Check admin.ts again: admin.ts selects * from users. 
        // Let's check table schema if possible. admin.ts has 'balance' and 'ens_name'.
        // I will assume for now we just want balance descending.
        
        const stmt = db.prepare(`
            SELECT address, ens_name, balance, updated_at
            FROM users 
            ORDER BY balance DESC 
            LIMIT 50
        `);
        const { results } = await stmt.all();

        return new Response(JSON.stringify({ 
            leaderboard: results 
        }), {
            status: 200,
            headers: {
                "Content-Type": "application/json"
            }
        });
    } catch (e) {
        console.error("Leaderboard error:", e);
        return new Response(JSON.stringify({ error: "Failed to fetch leaderboard", details: String(e) }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
