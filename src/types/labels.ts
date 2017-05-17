/**
 * A label with which the records can be tagged.
 */
export interface Label {
    /**
     * Unique id of this label.
     */
    id: number;
    /**
     * Name of this label.
     */
    name: string;
    /**
     * Amount of recordings tagged with this label;
     */
    recordings: number;
}
