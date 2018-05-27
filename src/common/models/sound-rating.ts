import { Column, PrimaryGeneratedColumn, Entity, ManyToOne } from "typeorm";
import { is, scope, uuid, oneOf, required, specify } from "hyrest";
import { world, rateSound, listRatings } from "../scopes";
import { Sound } from "./sound";
import { User } from "./user";

@Entity()
export class SoundRating {
    @PrimaryGeneratedColumn("uuid")
    @scope(world) @is().validate(uuid)
    public id?: string;

    @ManyToOne(() => Sound, sound => sound.ratings)
    @is() @scope(world, listRatings) @specify(() => Sound)
    public sound?: Sound;

    @ManyToOne(() => User, user => user.soundRatings)
    @is() @scope(world, listRatings) @specify(() => User)
    public user?: User;

    @Column("int")
    @is().validate(required, oneOf(1, 2, 3, 4, 5)) @scope(world, rateSound, listRatings)
    public stars?: number;
}
