import { Connection } from "typeorm";
import { controller, route, ok, populate } from "hyrest";
import { component, inject } from "tsdi";
import {
    StatisticOverview,
    StatisticSoundsPerSource,
    StatisticRecordingsPerUser,
    StatisticCreationsPerUser,
    StatisticPlaybacksPerUser,
    Sound,
    User,
    Tag,
    SoundTagRelation,
} from "../models";
import { statistics } from "../scopes";

@controller @component
export class Statistics {
    @inject private db: Connection;

    @route("GET", "/statistics/overview").dump(StatisticOverview, statistics)
    public async getOverview(): Promise<StatisticOverview> {
        const soundRepository = this.db.getRepository(Sound);
        const userRepository = this.db.getRepository(User);
        const tagRepository = this.db.getRepository(Tag);
        const soundTagRelationRepository = this.db.getRepository(SoundTagRelation);
        const totalSounds = await soundRepository.count();
        const totalUsers = await userRepository.count();
        const { totalUnrated } = await this.db.createQueryBuilder()
            .select("COUNT(*)", "totalUnrated")
            .from(qb => {
                return qb
                    .select("sound.id", "id")
                    .from(Sound, "sound")
                    .leftJoin("sound.ratings", "rating")
                    .groupBy("sound.id")
                    .having("COUNT(rating.id) = 0");
            }, "sound")
            .getRawOne();
        const { totalUntagged } = await this.db.createQueryBuilder()
            .select("COUNT(*)", "totalUntagged")
            .from(qb => {
                return qb
                    .select("sound.id", "id")
                    .from(Sound, "sound")
                    .leftJoin("sound.soundTagRelations", "soundTagRelation")
                    .groupBy("sound.id")
                    .having("COUNT(soundTagRelation.id) = 0");
            }, "sound")
            .getRawOne();
        const oldestSound = (await soundRepository.findOne({
            order: {
                created: "ASC",
            },
        })).created;
        const totalTags = await tagRepository.count();
        const totalTagged = await soundTagRelationRepository.count();
        const { totalPlaybacks } = await soundRepository.createQueryBuilder("sound")
            .select("SUM(sound.used)", "totalPlaybacks")
            .getRawOne();
        return ok(populate(statistics, StatisticOverview, {
            totalSounds,
            totalUsers,
            totalUnrated,
            totalUntagged,
            oldestSound,
            totalTags,
            totalTagged,
            totalPlaybacks,
        }));
    }

    @route("GET", "/statistics/creations-per-user").dump(StatisticCreationsPerUser, statistics)
    public async getCreationsPerUser(): Promise<StatisticCreationsPerUser> {
        const creationsPerUser = await this.db.createQueryBuilder()
            .select("user.id", "userId")
            .addSelect("COUNT(creation.id)", "creations")
            .from(User, "user")
            .leftJoin("user.reported", "creation")
            .groupBy("user.id")
            .getRawMany();
        return ok(populate(statistics, StatisticCreationsPerUser, {
            creationsPerUser: creationsPerUser.map(({ userId, creations }) => {
                return {
                    user: { id: userId },
                    creations,
                };
            }),
        }));
    }

    @route("GET", "/statistics/playbacks-per-user").dump(StatisticPlaybacksPerUser, statistics)
    public async getPlaybacksPerUser(): Promise<StatisticPlaybacksPerUser> {
        const playbacksPerUser = await this.db.createQueryBuilder()
            .select("user.id", "userId")
            .addSelect("SUM(sound.used)", "playbacks")
            .from(User, "user")
            .leftJoin("user.sounds", "sound")
            .groupBy("user.id")
            .getRawMany();
        return ok(populate(statistics, StatisticPlaybacksPerUser, {
            playbacksPerUser: playbacksPerUser.map(({ userId, playbacks }) => {
                return {
                    user: { id: userId },
                    playbacks,
                };
            }),
        }));
    }

    @route("GET", "/statistics/recordings-per-user").dump(StatisticRecordingsPerUser, statistics)
    public async getRecordingsPerUser(): Promise<StatisticRecordingsPerUser> {
        const recordingsPerUser = await this.db.createQueryBuilder()
            .select("user.id", "userId")
            .addSelect("COUNT(sound.id)", "recordings")
            .from(User, "user")
            .leftJoin("user.sounds", "sound")
            .groupBy("user.id")
            .getRawMany();
        return ok(populate(statistics, StatisticRecordingsPerUser, {
            recordingsPerUser: recordingsPerUser.map(({ userId, recordings }) => {
                return {
                    user: { id: userId },
                    recordings,
                };
            }),
        }));
    }

    @route("GET", "/statistics/sounds-per-source").dump(StatisticSoundsPerSource, statistics)
    public async getSoundsPerSource(): Promise<StatisticSoundsPerSource> {
        const soundsPerSource = await this.db.createQueryBuilder()
            .select("sound.source", "source")
            .addSelect("COUNT(sound.id)", "sounds")
            .from(Sound, "sound")
            .groupBy("sound.source")
            .getRawMany();
        return ok(populate(statistics, StatisticSoundsPerSource, { soundsPerSource }));
    }
}
