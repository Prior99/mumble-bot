import { metadata, command, Command } from "clime";
import { createConnection, Connection as PostgresConnection } from "typeorm";
import * as MySQL from "promise-mysql";
import { info, error, warn } from "winston";
import { MigrationConfig } from "../config";
import { allDatabaseModels, User, MumbleLink } from "../common";

interface SourceUser {
    id: number;
    username: string;
    password: string;
    email: string;
    money: number;
}

interface SourceLink {
    mumbleId: number;
    user: number;
}

@command({ description: "Migrate a 0.2.1 database to 1.0.0" })
export default class MigrateCommand extends Command { // tslint:disable-line
    private config: MigrationConfig;
    private targetDb: PostgresConnection;
    private sourceDb: MySQL.Connection;

    private userIdMapping: Map<number, string> = new Map();

    private async confirm() {
        process.stdin.resume();
        process.stdout.write("This will destroy the target database and delete the target directories.\n");
        process.stdout.write("The source database will be accessed but left intact. Source files will be copied.\n");
        process.stdout.write(`Do you wish to continue? (Type "yes".) `);
        const okay = await new Promise(resolve => process.stdin.once("data", (data) => {
            resolve(data.toString().trim() === "yes");
        }));
        if (!okay) { process.stdout.write("Aborting.\n"); }
        return okay;
    }

    private async connectTargetDatabase() {
        const {
            targetDbName: database,
            targetDbDriver: driver,
            targetDbPassword: password,
            targetDbPort: port,
            targetDbUsername: username,
            targetDbHost: host,
        } = this.config;
        info(`Connecting to target database: ${driver}://${username}:${password}@${host}:${port}/${database} ...`);
        try {
            this.targetDb = await createConnection({
                entities: allDatabaseModels,
                type: driver as any,
                synchronize: true,
                dropSchema: true,
                database,
                password,
                port,
                username,
                host,
            });
            info("Connected to target database.");
            return true;
        } catch (err) {
            error(`Error connecting to target database: ${err.message}`);
            console.error(err);
            return false;
        }
    }

    private async connectSourceDatabase() {
        const {
            sourceDbName: database,
            sourceDbPassword: password,
            sourceDbPort: port,
            sourceDbUsername: user,
            sourceDbHost: host,
        } = this.config;
        info(`Connecting to source database: mysql://${user}:${password}@${host}:${port}/${database} ...`);
        try {
            this.sourceDb = await MySQL.createConnection({
                database: this.config.sourceDbName,
                password: this.config.sourceDbPassword,
                port: this.config.sourceDbPort,
                user: this.config.sourceDbUsername,
                host: this.config.sourceDbHost,
            });
            info("Connected to target database.");
            return true;
        } catch (err) {
            error(`Error connecting to source database: ${err.message}`);
            console.error(err);
            return false;
        }
    }

    private async migrateMumbleLink(sourceLink: SourceLink) {
        const targetUserId = this.userIdMapping.get(sourceLink.user);
        info(`Migrating link ${sourceLink.user} (${targetUserId}) -> (${sourceLink.mumbleId}) ...`);
        const targetLink = new MumbleLink();
        Object.assign(targetLink, {
            user: { id: targetUserId },
            mumbleId: sourceLink.mumbleId,
        });
        await this.targetDb.getRepository(MumbleLink).save(targetLink);
    }

    private async migrateMumbleLinks() {
        info("Migrating mumble linkages ...");
        const rows = await this.sourceDb.query(`
            SELECT
                mumbleId,
                user
            FROM MumbleUsers
        `);
        info(`Found ${rows.length} links to migrate.`);
        for (let row of rows) {
            await this.migrateMumbleLink(row);
        }
        info("All links migrated.");
    }

    private async migrateUser(sourceUser: SourceUser) {
        info(`Migrating user ${sourceUser.username} (${sourceUser.id}) ...`);
        const targetUser = new User();
        Object.assign(targetUser, {
            name: sourceUser.username,
            password: sourceUser.password,
            email: sourceUser.email,
            score: sourceUser.money,
        });
        await this.targetDb.getRepository(User).save(targetUser);
        this.userIdMapping.set(sourceUser.id, targetUser.id);
    }

    private async migrateUsers() {
        info("Migrating users ...");
        const rows = await this.sourceDb.query(`
            SELECT
                id,
                username,
                password,
                email,
                money
            FROM Users
        `);
        info(`Found ${rows.length} users to migrate.`);
        for (let row of rows) {
            await this.migrateUser(row);
        }
        info("All users migrated.");
    }

    @metadata
    public async execute(config: MigrationConfig) {
        this.config = config;
        if (!await this.confirm()) { return; }
        if (!await this.connectTargetDatabase()) { return; }
        if (!await this.connectSourceDatabase()) { return; }

        await this.migrateUsers();
        await this.migrateMumbleLinks();

        await this.targetDb.close();
        info("Disconnected from target database.");
        await this.sourceDb.end();
        info("Disconnected from source database.");
        process.stdin.end();
    }
}
