/**
 * A cached audio.
 */
export interface CachedAudio {
    /**
     * The filename of the audio.
     */
    file: string;
    /**
     * The date the audio was recorded.
     */
    date: Date;
    /**
     * The user from which the audio was recorded.
     */
    user: number;
    /**
     * The id of the cached audio.
     */
    id: number;
    /**
     * The duration of the audio in seconds.
     */
    duration: number;
    /**
     * Whether the audio was protected by someone or not.
     */
    protected: boolean;
}
