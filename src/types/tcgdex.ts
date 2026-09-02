export interface TCGdexCardSummary {
  id: string;
  localId: string;
  name: string;
  image?: string;
}

export interface TCGdexSetSummary {
  id: string;
  name: string;
  cardCount?: {
    total: number;
    official: number;
  };
  logo?: string;
  symbol?: string;
}

export interface TCGdexCardDetail {
  id: string;
  localId: string;
  name: string;
  image?: string;
  category?: string;
  illustrator?: string;
  rarity?: string;
  set?: {
    id: string;
    name: string;
    cardCount?: {
      official: number;
      total: number;
    };
  };
  hp?: number;
  types?: string[];
  description?: string;
  stage?: string;
  attacks?: Array<{
    name: string;
    cost?: string[];
    damage?: string | number;
    effect?: string;
  }>;
  weaknesses?: Array<{
    type: string;
    value: string;
  }>;
  retreat?: number;
  regulationMark?: string;
  pricing?: {
    cardmarket?: {
      avg?: number;
      trend?: number;
      low?: number;
      unit?: string;
    };
  };
}
