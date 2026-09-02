/**
 * Helper to generate live marketplace search links for Indonesian Pokémon Cards
 */

export const getTokopediaSearchUrl = (name: string, set?: string, localId?: string): string => {
  const queryParts = ['pokemon', name];
  if (set) queryParts.push(set);
  if (localId) queryParts.push(localId);
  const query = encodeURIComponent(queryParts.join(' '));
  return `https://www.tokopedia.com/search?st=product&q=${query}`;
};

export const getShopeeSearchUrl = (name: string, set?: string, localId?: string): string => {
  const queryParts = ['kartu pokemon', name];
  if (set) queryParts.push(set);
  if (localId) queryParts.push(localId);
  const query = encodeURIComponent(queryParts.join(' '));
  return `https://shopee.co.id/search?keyword=${query}`;
};
