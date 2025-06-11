import { loadAllApplicationData, diagnoseStoreData } from './src/lib/fixDataDisplayErrors';

(async () => {
  try {
    const result = await loadAllApplicationData();
    console.log('Load Result:', result);
    console.log('Diagnostics:', diagnoseStoreData());
  } catch (err) {
    console.error('Error running loadAllApplicationData:', err);
  }
})();
