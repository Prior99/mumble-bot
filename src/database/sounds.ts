/**
 * Extends the database with methods for sounds.
 * @param {Database} Database - The Database class to extend.
 * @return {undefined}
 */
const SoundsExtension = function(Database) {
    /**
     * @typedef DatabaseSound
     * @property {string} name - The name of the sound (filename).
     * @property {number} id - Unique id of this sound.
     * @property {number} used - How often the sound was already palyed back.
     */
    /**
     * <b>Async</b> Add a new sound to the database.
     * @param {string} name - The name of the sound to add (filename).
     * @return {number} - The unique id of the newly created sound.
     */
    Database.prototype.addSound = async function(name) {
        const result = await this.connection.query("INSERT INTO Sounds(name) VALUES(?)", [name]);
        return result.insertId;
    };

    /**
     * <b>Async</b> List all sounds in the database.
     * @return {Sound[]} - List of all sounds in the database.
     */
    Database.prototype.listSounds = async function() {
        const rows = await this.connection.query("SELECT id, name, used FROM Sounds ORDER BY name, used DESC");
        return rows;
    };

    /**
     * <b>Async</b> Get details on sepcific sound.
     * @param {number} id - Id of the sound to fetch details of.
     * @return {Sound} - Sound that was requested or null if no such sound was found.
     */
    Database.prototype.getSound = async function(id) {
        const rows = await this.connection.query("SELECT id, name, used FROM Sounds WHERE id = ?", [id]);
        if(rows && rows.length > 0) {
            return rows[0];
        }
        else {
            return null;
        }
    }

    /**
     * <b>Async</b> Update a sound to be played back one more times (Increase usages by one).
     * @param {number} id - Unique id of the sound to update.
     * @return {undefined}
     */
    Database.prototype.usedSound = async function(id) {
        await this.connection.query("UPDATE Sounds SET used = used +1 WHERE id = ?", [id]);
    };
};

export default SoundsExtension;
