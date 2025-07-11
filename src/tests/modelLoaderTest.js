import ModelLoader from '../../modules/ai/models/ModelLoader.js';

async function runTest() {
    try {
        const results = await ModelLoader.testGeneration();
        console.log('Results:', results);
    } catch (error) {
        console.error('Erreur lors du test de génération:', error);
    }
}

runTest();
