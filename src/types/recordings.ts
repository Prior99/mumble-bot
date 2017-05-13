/**
 * A single record as represented in the database.
 * @typedef Record
 */
export interface Recording {
    /**
     * Unique id of this record which is used as the mapping to the audio file.
     */
    id: number;
    /**
     * The quote for this record (textual description).
     */
    quote: string;
    /**
     * How often this record was already used.
     */
    used: number;
    /**
     * The user who said this record.
     */
    user: number;
    /**
     * The user who reported the record.
     */
    reporter: number;
    /**
     * Whether this forked record overwrites the original one.
     */
    overwrite: boolean;
    /**
     * Id of the record this record is forked from or null if its an original one.
     */
    parent: number;
    /**
     * When the record was originally recorded.
     */
    submitted: Date;
    /**
     * A list of all labels with which this record was tagged.
     */
    labels: number;
    /**
     * Duration in seconds of this recording.
     */
    duration: number;
}
