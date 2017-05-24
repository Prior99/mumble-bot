export interface DatabaseSound {
    /**
     * The name of the sound (filename).
     */
    name: string;
    /**
     * Unique id of this sound.
     */
    id: number;
    /**
     * How often the sound was already palyed back.
     */
    used: number;
}
