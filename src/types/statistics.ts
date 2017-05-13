export interface PlaybackCountByUserStat {
    /**
     * How often all records of the user have been played back in total.
     */
    playbacks: number;
    /**
     * Name of the user to which the playbacks belong.
     */
    user: string;
    /**
     * playbacks relative to total amount of records in the database.
     */
    playbacksRelative: number;
}

export interface PlaybackCountByDateStat {
    /**
     * Amount of records this user has.
     */
    amount: number;
    /**
     * Date of the day this entry belongs to.
     */
    date: Date;
}

export interface RecordingCountByUserStat {
    /**
     * Amount of records this user has.
     */
    amount: number;
    /**
     * Name of the user the records belong to.
     */
    user: string;
}


export interface RecordingCountByDateStat {
    /**
     * Amount of records this user has.
     */
    amount: number;
    /**
     * Date the records were submitted.
     */
    submitted: Date;
}

export interface StatObjectSpeechPerHour {
    /**
     * The hour this object is representing.
     */
    hour: number;
    /**
     * Amount of speech in this hour.
     */
    amount: number;
}
export interface StatObjectSpeechPerUser {
    /**
     * Name of the user this object is representing.
     */
    user: string;
    /**
     * Amount of speech in this hour.
     */
    amount: number;
}
export interface StatObjectSpeechPerWeekday {
    /**
     * Name of the weekday this object is representing.
     */
    day: number;
    /**
     * Amount of speech in this hour.
     */
    amount: number;
}
export interface StatObjectOnlinePerUser {
    /**
     * Name of the user this object is representing.
     */
    user: string;
    /**
     * Amount of time the user was online in seconds.
     */
    amount: number;
}
