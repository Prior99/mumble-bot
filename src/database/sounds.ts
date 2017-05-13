/**
 * @typedef DatabaseSound
 * @property {string} name - The name of the sound (filename).
 * @property {number} id - Unique id of this sound.
 * @property {number} used - How often the sound was already palyed back.
 */
/**
 * Add a new sound to the database.
 * @param {string} name - The name of the sound to add (filename).
 * @return {number} - The unique id of the newly created sound.
 */
export async function addSound(name, connection) {
    const result = await connection.query("INSERT INTO Sounds(name) VALUES(?)", [name]);
    return result.insertId;
};

/**
 * List all sounds in the database.
 * @return {Sound[]} - List of all sounds in the database.
 */
export async function listSounds(connection) {
    const rows = await connection.query("SELECT id, name, used FROM Sounds ORDER BY name, used DESC");
    return rows;
};

/**
 * Get details on sepcific sound.
 * @param {number} id - Id of the sound to fetch details of.
 * @return {Sound} - Sound that was requested or null if no such sound was found.
 */
export async function getSound(id, connection) {
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
 * @param {number} id - Unique id of the sound to update.
 * @return {undefined}
 */
export async function usedSound(id, connection) {
    await connection.query("UPDATE Sounds SET used = used +1 WHERE id = ?", [id]);
};

