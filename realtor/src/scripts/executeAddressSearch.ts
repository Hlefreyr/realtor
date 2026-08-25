import fs from 'fs';
import path from 'path';
import { RealEstateProviderFactory } from '../services/RealEstateProvider';

async function runAddressSearch() {
  const exampleAddress = '2692B Hwy 528 (Wolseley Bay Road), Noelville, Ontario P0M2N0';
  console.log(`Executing search by address for: "${exampleAddress}"`);

  const provider = RealEstateProviderFactory.getProvider();
  const searchResults = await provider.searchByAddress(exampleAddress);

  const outputPath = path.resolve(__dirname, '../../../Product/address-search-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(searchResults, null, 2), 'utf-8');

  console.log(`Saved search results to: ${outputPath}`);
}

runAddressSearch().catch((err) => {
  console.error('Error executing address search script:', err);
  process.exit(1);
});
