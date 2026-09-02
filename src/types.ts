export type GameKey = 'linerangers' | 'cookierun' | 'kaibee' | 'efootball' | 'custom';

export interface CharacterItem {
  id: string;
  name: string;
  chineseName?: string;
  img?: string;
  category?: string;
  count: number;
  featured?: boolean;
  isPremium?: boolean;
  collab?: string;
}

export interface AccountResources {
  stage?: number;
  rubies?: number;
  tickets?: number;
  coins?: string;
  extraTokens?: string[];
}

export interface CustomAccountOverride {
  customName?: string;
  customImage?: string;
  customPrice?: string;
  customNotes?: string;
}

export interface InventoryAccount {
  id: string;
  rawString: string;
  displayId: string;
  index: number;
  gameKey: GameKey;
  characters: CharacterItem[];
  characterCount: number;
  collabSeries: string[];
  resources: AccountResources;
  unmatched: string[];
  tags: string[];
  selected?: boolean;
  customPrice?: string;
  customName?: string;
  customImage?: string;
  notes?: string;
}

export interface GameMetadata {
  key: GameKey;
  name: string;
  englishName: string;
  iconName: string;
  badgeColor: string;
  description: string;
}

export type ExportPreset =
  | 'line_bullet'
  | 'discord_box'
  | 'social_emoji'
  | 'forum_8591'
  | 'compact_csv'
  | 'clean_table'
  | 'custom';

export interface ExportTemplateConfig {
  preset: ExportPreset;
  includeId: boolean;
  includeGameName: boolean;
  includeCollabs: boolean;
  includeCharacters: boolean;
  includeResources: boolean;
  includeCustomPrice: boolean;
  includeContact: boolean;
  shopTitle: string;
  contactLine: string;
  customTemplateString?: string;
}
