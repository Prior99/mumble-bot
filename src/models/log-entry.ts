import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn
} from "typeorm";
import { is, scope, DataType, oneOf, specify, required, length, uuid, transform } from "hyrest";
import { world } from "../scopes";

export type LogLevel = "error" | "warning" | "verbose" | "info" | "debug";

/**
 * One entry in the bots log.
 */
@Entity()
export class LogEntry {
    @PrimaryGeneratedColumn("uuid")
    @scope(world) @is().validate(uuid)
    public id?: string;

    /**
     * Loglevel (Consult winston for this.) error, warning, verbose, info, etc...
     */
    @Column("varchar", { length: 100 })
    @is() @scope(world)
    public level: LogLevel;

    /**
     * The message that was logged.
     */
    @Column("text")
    @is() @scope(world)
    public message: string;

    /**
     * The date and time this was logged.
     */
    @CreateDateColumn()
    @scope(world) @specify(() => Date) @is()
    public timestamp: Date;
}
