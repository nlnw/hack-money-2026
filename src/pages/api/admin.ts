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

function checkAuth(context: APIContext): boolean {
    const password = context.request.headers.get('X-Admin-Password');
    const envPassword = (context.locals as any).runtime?.env?.ADMIN_PASSWORD;

    if (!envPassword) {
        console.warn('ADMIN_PASSWORD secret not set');
        return false;
    }

    return password === envPassword;
}

// GET: List all users
export const GET: APIRoute = async (context: APIContext) => {
    if (!checkAuth(context)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const db = (context.locals as any).runtime?.env?.DB as D1Database;

        if (!db) {
            return new Response(JSON.stringify({ error: 'Database not available' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const users = await db.prepare('SELECT * FROM users ORDER BY updated_at DESC').all<User>();

        return new Response(JSON.stringify({ users: users.results }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Database error', details: String(error) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

// POST: Update or delete user
export const POST: APIRoute = async (context: APIContext) => {
    if (!checkAuth(context)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const data = await context.request.json() as {
            action: 'update' | 'delete' | 'reset_all';
            address?: string;
            balance?: number;
        };

        const db = (context.locals as any).runtime?.env?.DB as D1Database;

        if (!db) {
            return new Response(JSON.stringify({ error: 'Database not available' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (data.action === 'update' && data.address && data.balance !== undefined) {
            await db.prepare(
                'UPDATE users SET balance = ?, updated_at = ? WHERE address = ?'
            ).bind(data.balance, Math.floor(Date.now() / 1000), data.address.toLowerCase()).run();

            return new Response(JSON.stringify({ success: true, message: 'User updated' }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (data.action === 'delete' && data.address) {
            await db.prepare('DELETE FROM users WHERE address = ?').bind(data.address.toLowerCase()).run();

            return new Response(JSON.stringify({ success: true, message: 'User deleted' }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (data.action === 'reset_all') {
            await db.prepare('UPDATE users SET balance = 1000').run();

            return new Response(JSON.stringify({ success: true, message: 'All balances reset to 1000' }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ error: 'Invalid action' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Database error', details: String(error) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
