import { observable } from "mobx";
import { initialize, component, inject } from "tsdi";
import {
    Statistics,
    StatisticOverview,
    SoundsPerSingleSource ,
    RecordingsPerSingleUser,
    CreationsPerSingleUser,
    PlaybacksPerSingleUser,
    SoundsPerSingleMonth,
} from "../../common";

@component
export class StatisticsStore {
    @inject private statisticsController: Statistics;

    @observable public overview: StatisticOverview = undefined;
    @observable public soundsPerSource: SoundsPerSingleSource[] = undefined;
    @observable public recordingsPerUser: RecordingsPerSingleUser[] = undefined;
    @observable public creationsPerUser: CreationsPerSingleUser[] = undefined;
    @observable public playbacksPerUser: PlaybacksPerSingleUser[] = undefined;
    @observable public soundsPerMonth: SoundsPerSingleMonth[] = undefined;

    @initialize protected async initialize() {
        const overview = await this.statisticsController.getOverview();
        const { soundsPerSource } = await this.statisticsController.getSoundsPerSource();
        const { recordingsPerUser } = await this.statisticsController.getRecordingsPerUser();
        const { creationsPerUser } = await this.statisticsController.getCreationsPerUser();
        const { playbacksPerUser } = await this.statisticsController.getPlaybacksPerUser();
        const { soundsPerMonth } = await this.statisticsController.getSoundsPerMonth();
        this.overview = overview;
        this.soundsPerSource = soundsPerSource;
        this.recordingsPerUser = recordingsPerUser;
        this.creationsPerUser = creationsPerUser;
        this.playbacksPerUser = playbacksPerUser;
        this.soundsPerMonth = soundsPerMonth;
    }
}
