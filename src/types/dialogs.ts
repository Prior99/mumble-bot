/**
 * A dialog as represented in the database including all its records.
 * @typedef Dialog
 */
export interface Dialog {
    /**
     * Unique id of this dialog.
     */
    id: number;
    /**
     * The date when this dialog was submitted.
     */
    submitted: Date;
    /**
     * How often this dialog was used.
     */
    used: number;
    /**
     * All records belonging to this dialog.
     */
    recordings: number[];
}
