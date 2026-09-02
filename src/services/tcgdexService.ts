import { TCGdexCardSummary, TCGdexSetSummary, TCGdexCardDetail } from '../types/tcgdex';

const BASE_URL = import.meta.env.VITE_TCGDEX_API_URL || 'https://api.tcgdex.net/v2/id';

// Cache sets for fast lookups
let cachedSets: TCGdexSetSummary[] | null = null;

export const tcgdexService = {
  /**
   * Search Pokémon cards in Indonesian by name or set
   */
  async searchCards(query: string): Promise<TCGdexCardSummary[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      const response = await fetch(`${BASE_URL}/cards?name=${encodeURIComponent(query.trim())}`);
      if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error(`TCGdex API error: ${response.statusText}`);
      }
      const data: TCGdexCardSummary[] = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error searching TCGdex cards:', error);
      return [];
    }
  },

  /**
   * Get full details of a specific card
   */
  async getCardDetail(cardId: string): Promise<TCGdexCardDetail | null> {
    if (!cardId) return null;
    try {
      const response = await fetch(`${BASE_URL}/cards/${encodeURIComponent(cardId)}`);
      if (!response.ok) return null;
      const data: TCGdexCardDetail = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching TCGdex card details for ${cardId}:`, error);
      return null;
    }
  },

  /**
   * Get all official Indonesian Pokémon TCG sets
   */
  async getSets(): Promise<TCGdexSetSummary[]> {
    if (cachedSets && cachedSets.length > 0) return cachedSets;
    try {
      const response = await fetch(`${BASE_URL}/sets`);
      if (!response.ok) return [];
      const data: TCGdexSetSummary[] = await response.json();
      cachedSets = Array.isArray(data) ? data : [];
      return cachedSets;
    } catch (error) {
      console.error('Error fetching Indonesian TCGdex sets:', error);
      return [];
    }
  },

  /**
   * Build high-res WebP image URL from TCGdex asset CDN
   */
  getHighResImageUrl(cardIdOrImage: string, quality: 'high' | 'low' = 'high'): string {
    if (!cardIdOrImage) return '';
    if (cardIdOrImage.startsWith('http')) {
      // If already a full URL
      if (cardIdOrImage.endsWith('.png') || cardIdOrImage.endsWith('.webp') || cardIdOrImage.endsWith('.jpg')) {
        return cardIdOrImage;
      }
      return `${cardIdOrImage}/${quality}.webp`;
    }
    return `https://assets.tcgdex.net/id/${cardIdOrImage}/${quality}.webp`;
  },

  /**
   * Map TCGdex rarity string to clean Indonesian short badge
   */
  mapRarity(rarityStr?: string): string {
    if (!rarityStr) return '';
    const r = rarityStr.toLowerCase();
    if (r.includes('common') && !r.includes('uncommon')) return 'C';
    if (r.includes('uncommon')) return 'U';
    if (r.includes('double rare')) return 'RR';
    if (r.includes('special art rare')) return 'SAR';
    if (r.includes('art rare')) return 'AR';
    if (r.includes('super rare')) return 'SR';
    if (r.includes('ultra rare')) return 'UR';
    if (r.includes('rare')) return 'R';
    if (r.includes('promo')) return 'PROMO';
    return rarityStr.toUpperCase();
  }
};
