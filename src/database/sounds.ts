import { DatabaseSound } from "../types/sounds";

/**
 * Add a new sound to the database.
 * @param name The name of the sound to add (filename).
 * @return The unique id of the newly created sound.
 */
export async function addSound(name: string, connection): Promise<number> {
    const result = await connection.query("INSERT INTO Sounds(name) VALUES(?)", [name]);
    return result.insertId;
}

/**
 * List all sounds in the database.
 * @return List of all sounds in the database.
 */
export async function listSounds(connection): Promise<DatabaseSound[]> {
    const rows = await connection.query("SELECT id, name, used FROM Sounds ORDER BY name, used DESC");
    return rows;
}

/**
 * Get details on sepcific sound.
 * @param id Id of the sound to fetch details of.
 * @return Sound that was requested or null if no such sound was found.
 */
export async function getSound(id: number, connection): Promise<DatabaseSound> {
    const rows = await connection.query("SELECT id, name, used FROM Sounds WHERE id = ?", [id]);
    if (rows && rows.length > 0) {
        return rows[0];
    }
    else {
        return;
    }
}

/**
 * Update a sound to be played back one more times (Increase usages by one).
 * @param id Unique id of the sound to update.
 */
export async function usedSound(id: number, connection): Promise<void> {
    await connection.query("UPDATE Sounds SET used = used +1 WHERE id = ?", [id]);
}
