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

interface User {
    address: string;
    balance: number;
    ens_name: string | null;
    created_at: number;
    updated_at: number;
}

// GET: Fetch user balance (creates user with 1000 if not exists)
export const GET: APIRoute = async (context: APIContext) => {
    const url = new URL(context.request.url);
    const address = url.searchParams.get('address');

    if (!address) {
        return new Response(JSON.stringify({ error: 'Address required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const db = (context.locals as any).runtime?.env?.DB as D1Database;

        if (!db) {
            // Fallback for local dev without D1
            return new Response(JSON.stringify({
                address,
                balance: 1000,
                ens_name: null,
                source: 'fallback'
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Try to get existing user
        let user = await db.prepare(
            'SELECT * FROM users WHERE address = ?'
        ).bind(address.toLowerCase()).first<User>();

        // Create user if not exists
        if (!user) {
            await db.prepare(
                'INSERT INTO users (address, balance) VALUES (?, 1000)'
            ).bind(address.toLowerCase()).run();

            user = {
                address: address.toLowerCase(),
                balance: 1000,
                ens_name: null,
                created_at: Date.now(),
                updated_at: Date.now()
            };
        }

        return new Response(JSON.stringify(user), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Balance API Error:', error);
        return new Response(JSON.stringify({ error: 'Database error', details: String(error) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

// POST: Update user balance
export const POST: APIRoute = async (context: APIContext) => {
    try {
        const data = await context.request.json() as {
            address: string;
            delta: number;  // Amount to add (positive) or subtract (negative)
            ensName?: string;
        };

        if (!data.address || data.delta === undefined) {
            return new Response(JSON.stringify({ error: 'Address and delta required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const db = (context.locals as any).runtime?.env?.DB as D1Database;

        if (!db) {
            // Fallback for local dev
            return new Response(JSON.stringify({
                success: true,
                newBalance: 1000 + data.delta,
                source: 'fallback'
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const address = data.address.toLowerCase();

        // Get current balance or create user
        let user = await db.prepare(
            'SELECT balance FROM users WHERE address = ?'
        ).bind(address).first<{ balance: number }>();

        let newBalance: number;

        if (!user) {
            newBalance = 1000 + data.delta;
            await db.prepare(
                'INSERT INTO users (address, balance, ens_name) VALUES (?, ?, ?)'
            ).bind(address, newBalance, data.ensName || null).run();
        } else {
            newBalance = user.balance + data.delta;
            await db.prepare(
                'UPDATE users SET balance = ?, ens_name = COALESCE(?, ens_name), updated_at = ? WHERE address = ?'
            ).bind(newBalance, data.ensName || null, Math.floor(Date.now() / 1000), address).run();
        }

        return new Response(JSON.stringify({
            success: true,
            newBalance,
            address
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Balance Update Error:', error);
        return new Response(JSON.stringify({ error: 'Database error', details: String(error) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
