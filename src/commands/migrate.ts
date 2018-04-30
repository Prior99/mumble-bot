import { metadata, command, Command } from "clime";
import { createConnection, Connection as PostgresConnection } from "typeorm";
import * as FFMpeg from "fluent-ffmpeg";
import * as MySQL from "promise-mysql";
import * as mkdirp from "mkdirp";
import { info, error } from "winston";
import { MigrationConfig } from "../config";
import {
    allDatabaseModels,
    User,
    MumbleLink,
    Sound,
    Tag,
    SoundTagRelation,
    PermissionAssociation,
    Playlist,
    PlaylistEntry,
} from "../common";
import { writeFileSync, readFileSync } from "fs";
import { setupWinston } from "../common";

setupWinston();

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

interface SourceSound {
    id: number;
    name: string;
    used: number;
}

interface SourceRecording {
    id: number;
    quote: string;
    created: Date;
    user: number;
    reporter: number;
    used: number;
    changed: Date;
    duration: number;
    parent: number;
    overwrite: boolean;
}

interface SourceLabel {
    id: number;
    name: string;
}

interface SourceRecordingLabelRelation {
    record: number;
    label: number;
}

interface SourcePermission {
    user: number;
    permission: string;
}

interface SourceDialog {
    id: number;
    submitted: Date;
    used: number;
}

interface SourceDialogPart {
    id: number;
    dialogId: number;
    position: number;
    recordId: number;
}

// tslint:disable:await-promise

@command({ description: "Migrate a 0.2.1 database to 1.0.0" })
export default class MigrateCommand extends Command { // tslint:disable-line
    private config: MigrationConfig;
    private targetDb: PostgresConnection;
    private sourceDb: MySQL.Connection;

    private userIdMapping: Map<number, string> = new Map();
    private labelIdMapping: Map<number, string> = new Map();
    private recordingIdMapping: Map<number, string> = new Map();
    private playlistIdMapping: Map<number, string> = new Map();

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
            try {
                await this.migrateMumbleLink(row);
            } catch (err) {
                error(`Unable to migrate link ${row.user} -> ${row.mumbleId}: ${err.message}`);
                console.error(err);
            }
        }
        info("All links migrated.");
    }

    private async migrateLabel(sourceLabel: SourceLabel) {
        info(`Migrating label ${sourceLabel.name} (${sourceLabel.id}) ...`);
        const targetTag = new Tag();
        Object.assign(targetTag, { name: sourceLabel.name });
        await this.targetDb.getRepository(Tag).save(targetTag);
        this.labelIdMapping.set(sourceLabel.id, targetTag.id);
    }

    private async migrateLabels() {
        info("Migrating labels ...");
        const rows = await this.sourceDb.query(`
            SELECT
                id,
                name
            FROM RecordLabels
        `);
        info(`Found ${rows.length} labels to migrate.`);
        for (let row of rows) {
            try {
                await this.migrateLabel(row);
            } catch (err) {
                error(`Unable to migrate label ${row.name} (${row.id}): ${err.message}`);
                console.error(err);
            }
        }
        info("All labels migrated.");
    }

    private async migrateRecordingLabelRelation(sourceRecordingLabelRelation: SourceRecordingLabelRelation) {
        const targetSoundId = this.recordingIdMapping.get(sourceRecordingLabelRelation.record);
        const targetTagId = this.labelIdMapping.get(sourceRecordingLabelRelation.label);
        info(`Migrating recording label relation ${targetTagId} (${sourceRecordingLabelRelation.label}) -> ` +
            `${targetSoundId} (${sourceRecordingLabelRelation.record}) ...`);
        const targetSoundTagRelation = new SoundTagRelation();
        Object.assign(targetSoundTagRelation, {
            sound: { id: targetSoundId },
            tag: { id: targetTagId },
        });
        await this.targetDb.getRepository(SoundTagRelation).save(targetSoundTagRelation);
    }

    private async migrateRecordingLabelRelations() {
        info("Migrating recording labels relations ...");
        const rows = await this.sourceDb.query(`
            SELECT
                record,
                label
            FROM RecordLabelRelation
        `);
        info(`Found ${rows.length} relations to migrate.`);
        for (let row of rows) {
            try {
                await this.migrateRecordingLabelRelation(row);
            } catch (err) {
                error(`Unable to migrate recording label relation ${row.record} -> ${row.label}): ${err.message}`);
                console.error(err);
            }
        }
        info("All recording label relations migrated.");
    }

    private async migratePermission(sourcePermission: SourcePermission) {
        info(`Migrating permission ${sourcePermission.user} -> ${sourcePermission.permission} ...`);
        const targetPermission = new PermissionAssociation();
        Object.assign(targetPermission, {
            user: this.userIdMapping.get(sourcePermission.user),
            permission: sourcePermission.permission,
        });
        await this.targetDb.getRepository(PermissionAssociation).save(targetPermission);
    }

    private async migratePermissions() {
        info("Migrating permissions ...");
        const rows = await this.sourceDb.query(`
            SELECT
                user,
                permission
            FROM UserPermissions
            WHERE
                permission = "login" OR
                permission = "grant" OR
                permission = "be-quiet"
        `);
        info(`Found ${rows.length} permissions to migrate.`);
        for (let row of rows) {
            try {
                await this.migratePermission(row);
            } catch (err) {
                error(`Unable to migrate permission ${row.user} -> ${row.permission}: ${err.message}`);
                console.error(err);
            }
        }
        info("All permissions migrated.");
    }

    private async migrateDialogPart(sourceDialogPart: SourceDialogPart) {
        info(`Migrating dialog part ${sourceDialogPart.id} ...`);
        const targetPlaylistEntry = new PlaylistEntry();
        Object.assign(targetPlaylistEntry, {
            sound: { id: this.recordingIdMapping.get(sourceDialogPart.recordId) },
            playlist: { id: this.playlistIdMapping.get(sourceDialogPart.dialogId) },
            position: sourceDialogPart.position,
        });
        await this.targetDb.getRepository(PlaylistEntry).save(targetPlaylistEntry);
    }

    private async migrateDialogParts() {
        info("Migrating dialog parts ...");
        const rows = await this.sourceDb.query(`
            SELECT
                id,
                dialogId,
                position,
                recordId
            FROM DialogParts
        `);
        info(`Found ${rows.length} dialog parts to migrate.`);
        for (let row of rows) {
            try {
                await this.migrateDialogPart(row);
            } catch (err) {
                error(`Unable to migrate dialog part ${row.id}: ${err.message}`);
                console.error(err);
            }
        }
        info("All dialog parts migrated.");
    }

    private async migrateDialog(sourceDialog: SourceDialog) {
        info(`Migrating dialog ${sourceDialog.id} ...`);
        const targetPlaylist = new Playlist();
        Object.assign(targetPlaylist, {
            created: sourceDialog.submitted,
            used: sourceDialog.used,
            creator: { id: this.userIdMapping.values().next().value },
            name: `Playlist from ${sourceDialog.submitted.toISOString()}`,
        });
        await this.targetDb.getRepository(Playlist).save(targetPlaylist);
        this.playlistIdMapping.set(sourceDialog.id, targetPlaylist.id);
    }

    private async migrateDialogs() {
        info("Migrating dialogs ...");
        const rows = await this.sourceDb.query(`
            SELECT
                id,
                submitted,
                used
            FROM Dialogs
        `);
        info(`Found ${rows.length} dialogs to migrate.`);
        for (let row of rows) {
            try {
                await this.migrateDialog(row);
            } catch (err) {
                error(`Unable to migrate dialog ${row.id}: ${err.message}`);
                console.error(err);
            }
        }
        info("All dialogs migrated.");
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
            try {
                await this.migrateUser(row);
            } catch (err) {
                error(`Unable to migrate user ${row.username} (${row.id}): ${err.message}`);
                console.error(err);
            }
        }
        info("All users migrated.");
    }

    private async migrateSound(sourceSound: SourceSound) {
        info(`Migrating uploaded sound ${sourceSound.name} (${sourceSound.id}) ...`);
        const targetSound = new Sound();
        const sourcePath = `${this.config.sourceUploadsDir}/${sourceSound.id}`;
        const soundMeta: any = await new Promise((resolve, reject) => {
            FFMpeg.ffprobe(sourcePath, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result);
            });
        });
        const now = new Date();
        Object.assign(targetSound, {
            description: sourceSound.name,
            used: sourceSound.used,
            source: "upload",
            creator: this.userIdMapping.values().next().value,
            created: now,
            changed: now,
            duration: soundMeta.format.duration,
        });
        await this.targetDb.getRepository(Sound).save(targetSound);
        const targetPath = `${this.config.targetSoundsDir}/${targetSound.id}`;
        writeFileSync(targetPath, readFileSync(sourcePath));
    }

    private async migrateSounds() {
        info("Migrating uploaded sounds ...");
        const rows = await this.sourceDb.query(`
            SELECT
                id,
                name,
                used
            FROM Sounds
        `);
        info(`Found ${rows.length} sounds to migrate.`);
        for (let row of rows) {
            try {
                await this.migrateSound(row);
            } catch (err) {
                error(`Unable to migrate uploaded sound ${row.name} (${row.id}): ${err.message}`);
                console.error(err);
            }
        }
        info("All uploaded sounds migrated.");
    }

    private async migrateRecording(sourceRecording: SourceRecording) {
        info(`Migrating recording (${sourceRecording.id}) ...`);
        const targetSound = new Sound();
        const sourcePath = `${this.config.sourceRecordingsDir}/${sourceRecording.id}`;
        Object.assign(targetSound, {
            description: sourceRecording.quote,
            used: sourceRecording.used,
            user: this.userIdMapping.get(sourceRecording.user),
            source: "recording",
            creator: this.userIdMapping.get(sourceRecording.reporter),
            overwrite: sourceRecording.overwrite,
            created: sourceRecording.created,
            updated: sourceRecording.changed,
            duration: sourceRecording.duration,
        });
        await this.targetDb.getRepository(Sound).save(targetSound);
        const targetPath = `${this.config.targetSoundsDir}/${targetSound.id}`;
        writeFileSync(targetPath, readFileSync(sourcePath));
        this.recordingIdMapping.set(sourceRecording.id, targetSound.id);
    }

    private async migrateRecordings() {
        info("Migrating recordings ...");
        const rows = await this.sourceDb.query(`
            SELECT
                id,
                quote,
                used,
                user,
                reporter,
                overwrite,
                submitted,
                duration,
                changed
            FROM Records
        `);
        info(`Found ${rows.length} recordings to migrate.`);
        for (let row of rows) {
            try {
                await this.migrateRecording(row);
            } catch (err) {
                error(`Unable to migrate recording ${row.name} (${row.id}): ${err.message}`);
                console.error(err);
            }
        }
        info("All recordings migrated.");
    }

    @metadata
    public async execute(config: MigrationConfig) {
        this.config = config;
        if (!await this.confirm()) { return; }
        if (!await this.connectTargetDatabase()) { return; }
        if (!await this.connectSourceDatabase()) { return; }

        mkdirp.sync(this.config.targetSoundsDir);

        await this.migrateUsers();
        await this.migratePermissions();
        await this.migrateMumbleLinks();
        await this.migrateRecordings();
        await this.migrateDialogs();
        await this.migrateDialogParts();
        await this.migrateLabels();
        await this.migrateRecordingLabelRelations();
        await this.migrateSounds();

        await this.targetDb.close();
        info("Disconnected from target database.");
        await this.sourceDb.end();
        info("Disconnected from source database.");
        process.stdin.end();
    }
}
