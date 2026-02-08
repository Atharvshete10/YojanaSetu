import { getDb } from '../database/db.js';

class StatModel {
    static async getStats() {
        const db = await getDb();

        const schemesCount = await db.get('SELECT COUNT(*) as count FROM schemes');
        const tendersCount = await db.get('SELECT COUNT(*) as count FROM tenders');
        const recruitmentsCount = await db.get('SELECT COUNT(*) as count FROM recruitments');

        return {
            schemesCount: schemesCount.count,
            tendersCount: tendersCount.count,
            recruitmentsCount: recruitmentsCount.count
        };
    }
}

export default StatModel;
