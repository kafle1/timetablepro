import { initializeAppwrite } from '../src/lib/config/init-appwrite';

async function main() {
    try {
        await initializeAppwrite();
        console.log('✅ Appwrite initialization completed successfully');
    } catch (error) {
        console.error('❌ Failed to initialize Appwrite:', error);
        process.exit(1);
    }
}

main(); 