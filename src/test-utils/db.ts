import { Connection } from "typeorm";
import { DatabaseFactory, MumbleFactory, AudioInput } from "../server";

export async function startDb() {
    const databaseFactory = tsdi.get(DatabaseFactory);
    await databaseFactory.connect();
    const db = tsdi.get(Connection);
    await db.query(`
        DROP SCHEMA public CASCADE;
        CREATE SCHEMA public;
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);
    await db.runMigrations();
    await tsdi.get(MumbleFactory).connect();
    await tsdi.get(AudioInput).initialize();
}

export async function stopDb() {
    const db = tsdi.get(Connection);
    // This needs to be performed in order to flush all active queries.
    // There might be queries ongoing which, on termination will fail all tests.
    // By executing this dummy query it is ensured that the database driver waits for
    // all queries before closing.
    await db.query("SELECT 1");
    await db.close();
}
