import { component, factory } from "tsdi";
import { Connection, EntityManager } from "typeorm";

@component
export class DatabaseFactory {
    public entityManager: EntityManager;
    public conn: Connection;

    @factory
    public getConnection(): Connection { return this.conn; }

    @factory
    public getEntityManager(): EntityManager { return this.entityManager; }
}
