import { PersonaService } from '../services/personaService';
import logger from '../utils/logger';

/**
 * Seed the database with initial data
 */
export async function seedDatabase(): Promise<void> {
    try {
        logger.info('Starting database seeding...');

        const personaService = new PersonaService();

        // This will create default personas if they don't exist
        await personaService.getAllPersonas();

        logger.info('Database seeding completed successfully');
    } catch (error) {
        logger.error('Error seeding database', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
    }
}

/**
 * Run seed script if called directly
 */
if (require.main === module) {
    seedDatabase()
        .then(() => {
            logger.info('Seed script completed');
            process.exit(0);
        })
        .catch((error) => {
            logger.error('Seed script failed', { error });
            process.exit(1);
        });
} 