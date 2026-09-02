import { GameKey, GameMetadata, CharacterItem, AccountResources, InventoryAccount, ExportTemplateConfig } from '../types';

export const GAME_METADATA_LIST: GameMetadata[] = [
  {
    key: 'linerangers',
    name: 'LINE Rangers 銀河特攻隊',
    englishName: 'LINE Rangers',
    iconName: 'Shield',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    description: '包含各大知名動漫聯動限定角色、7星/8星超進化神角組合',
  },
  {
    key: 'kaibee',
    name: 'LINE Rangers 資源號 (ไก่บี้ / 初始金幣紅寶石)',
    englishName: 'Kaibee Starter Accounts',
    iconName: 'Gem',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    description: '帶大量紅寶石 (Ruby)、轉蛋券 (Tickets)、指定過關關卡 (Stage) 與限定角',
  },
  {
    key: 'cookierun',
    name: 'Cookie Run 跑跑薑餅人',
    englishName: 'Cookie Run: OvenBreak',
    iconName: 'Cookie',
    badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    description: '餅乾角色、寵物 (P) 與寶物 (TS) 全套組合庫存',
  },
  {
    key: 'efootball',
    name: 'eFootball 實況足球',
    englishName: 'eFootball Mobile',
    iconName: 'Trophy',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    description: '金幣號、傳奇球員、精選球星現貨',
  },
  {
    key: 'custom',
    name: '自訂遊戲 / 批次貼上匯入',
    englishName: 'Custom / Batch Paste',
    iconName: 'FileSpreadsheet',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    description: '手動貼上帳號 ID、文字檔或從外部檔案直接解析',
  },
];

// Collab mapping for Line Rangers characters
export const COLLAB_MAPPING: Record<string, { collab: string; chineseName: string }> = {
  // Spy x Family 間諜家家酒
  anya: { collab: '間諜家家酒 (Spy x Family)', chineseName: '安妮亞·佛傑' },
  ultraanya: { collab: '間諜家家酒 (Spy x Family)', chineseName: '超進化 安妮亞' },
  yor: { collab: '間諜家家酒 (Spy x Family)', chineseName: '約兒·佛傑 (睡美人)' },
  loid: { collab: '間諜家家酒 (Spy x Family)', chineseName: '洛伊德·佛傑 (黃昏)' },
  bond: { collab: '間諜家家酒 (Spy x Family)', chineseName: '彭格 (大白狗)' },

  // Kaiju No. 8 怪獸8號
  kafka: { collab: '怪獸8號 (Kaiju No. 8)', chineseName: '日比野卡夫卡 (怪獸8號)' },
  kikoru: { collab: '怪獸8號 (Kaiju No. 8)', chineseName: '四之宮琪歌露' },
  reno: { collab: '怪獸8號 (Kaiju No. 8)', chineseName: '市川雷諾' },
  hoshina: { collab: '怪獸8號 (Kaiju No. 8)', chineseName: '保科宗四郎 (雙刀)' },
  naruhiko: { collab: '怪獸8號 (Kaiju No. 8)', chineseName: '鳴海弦' },

  // Gintama 銀魂
  gintoki: { collab: '銀魂 (Gintama)', chineseName: '坂田銀時 (阿銀)' },
  kagura: { collab: '銀魂 (Gintama)', chineseName: '神樂' },
  shinpachi: { collab: '銀魂 (Gintama)', chineseName: '志村新八' },
  hijikata: { collab: '銀魂 (Gintama)', chineseName: '土方十四郎' },

  // Chainsaw Man 鏈鋸人
  denji: { collab: '鏈鋸人 (Chainsaw Man)', chineseName: '淀治 (鏈鋸人)' },
  power: { collab: '鏈鋸人 (Chainsaw Man)', chineseName: '帕瓦 (血之惡魔)' },
  aki: { collab: '鏈鋸人 (Chainsaw Man)', chineseName: '早川秋 (狐狸惡魔)' },
  kobeni: { collab: '鏈鋸人 (Chainsaw Man)', chineseName: '東山小紅' },

  // Delicious in Dungeon 迷宮飯
  laios: { collab: '迷宮飯 (Dungeon Meshi)', chineseName: '萊歐斯' },
  marcille: { collab: '迷宮飯 (Dungeon Meshi)', chineseName: '瑪露希爾' },
  senshi: { collab: '迷宮飯 (Dungeon Meshi)', chineseName: '先史 (森西)' },

  // Dr. STONE 新石紀
  senku: { collab: '新石紀 (Dr. STONE)', chineseName: '石神千空' },

  // Other Popular Rangers
  moon: { collab: '特攻隊原創限定', chineseName: '西部牛仔饅頭人 (Moon)' },
  cowboymoon: { collab: '特攻隊原創限定', chineseName: '西部牛仔饅頭人 (Moon)' },
  westernmoon: { collab: '特攻隊原創限定', chineseName: '西部牛仔饅頭人 (Moon)' },
  beetle: { collab: '特攻隊原創限定', chineseName: '甲蟲王者' },
  boss: { collab: '特攻隊原創限定', chineseName: '部長 / 暴走部長' },
  cancer: { collab: '星座限定', chineseName: '巨蟹座' },
  davinci: { collab: '名畫大師', chineseName: '達文西' },
  chang: { collab: '三國/武將限定', chineseName: '張飛 / 武俠張' },
  qinshi: { collab: '帝王系列', chineseName: '秦始皇' },
  enjin: { collab: '機械神話', chineseName: '圓神 / 引擎俠' },
  shion: { collab: '動漫限定', chineseName: '紫苑' },
  taiyo: { collab: '太陽神話', chineseName: '太陽神' },
  hades: { collab: '冥界神話', chineseName: '冥王黑帝斯' },
  anubis: { collab: '埃及神話', chineseName: '胡狼阿努比斯' },
  kraithong: { collab: '泰國神話限定', chineseName: '鱷魚獵人 (Kraithong)' },
  muaythai: { collab: '活動限定', chineseName: '泰拳熊大' },
  maidcony: { collab: '活動限定', chineseName: '女僕兔兔' },
  radish: { collab: '限定角色', chineseName: '蘿蔔戰士' },
  slot: { collab: '限定角色', chineseName: '拉霸狂人' },
  soji: { collab: '武士限定', chineseName: '沖田總司' },
  haruka: { collab: '限定角色', chineseName: '遙 (Haruka)' },
  kyouka: { collab: '限定角色', chineseName: '鏡花 (Kyouka)' },
  tenka: { collab: '限定角色', chineseName: '天下 (Tenka)' },
  rock: { collab: '搖滾系列', chineseName: '搖滾巨星' },
  xmasbellfive: { collab: '聖誕限定', chineseName: '聖誕五鈴鈴' },
};

// Chinese names for Cookie Run
export const COOKIERUN_CHINESE: Record<string, string> = {
  blossom: '櫻花餅乾',
  cotton: '棉花糖餅乾',
  dino: '恐龍餅乾',
  kiwi: '奇異果餅乾',
  princess: '公主餅乾',
  rocket: '火箭餅乾',
  glitter: '閃耀餅乾',
  pistachio: '開心果餅乾',
  onion: '洋蔥餅乾',
  choco: '巧克力餅乾',
  ginseng: '千年人蔘',
  safety: '安全帽',
  lunchbox: '愛心便當',
  cocktail: '果汁特調',
  crepe: '法式薄餅',
  dagger: '匕首',
};

// Helper to sanitize remote image URL
export function getCleanImageUrl(rawPath?: string, targetOrigin = 'https://ledger-live-nine.vercel.app'): string {
  if (!rawPath) return '';
  let cleanPath = rawPath.replace(/^\/+/, '');

  // Fix known remote data path typos
  if (cleanPath === 'images/pic2/Hajim.png') {
    cleanPath = 'images/pic2/Hajime.png';
  } else if (cleanPath === 'images/pic2/UltraKukuru.png') {
    cleanPath = 'images/pic2/Kukuru.png';
  }

  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath;
  }
  return `${targetOrigin}/${cleanPath}`;
}

// Parse Raw ID Token into Structured Account
export function parseRawAccountToken(
  rawId: string,
  index: number,
  gameKey: GameKey,
  charLookup: Record<string, any> = {},
  targetOrigin = 'https://ledger-live-nine.vercel.app'
): InventoryAccount {
  const tokens = rawId
    .split('_')
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const charMap = new Map<string, CharacterItem>();
  const unmatched: string[] = [];
  const resources: AccountResources = {};
  const tags: string[] = [];
  const collabSet = new Set<string>();

  let displayId = '';

  tokens.forEach((tok) => {
    const lowerTok = tok.toLowerCase();

    // Check if it is a stage token e.g. stage151
    const stageMatch = tok.match(/^stage(\d+)$/i);
    if (stageMatch) {
      resources.stage = parseInt(stageMatch[1], 10);
      tags.push(`關卡 ${resources.stage}`);
      return;
    }

    // Check if it is a Ruby token e.g. RB2055
    const rubyMatch = tok.match(/^rb(\d+)$/i);
    if (rubyMatch) {
      resources.rubies = parseInt(rubyMatch[1], 10);
      tags.push(`紅寶石 ${resources.rubies.toLocaleString()}`);
      return;
    }

    // Check if it is a Ticket token e.g. TK105 or TK80
    const ticketMatch = tok.match(/^tk(\d+)$/i);
    if (ticketMatch) {
      resources.tickets = parseInt(ticketMatch[1], 10);
      tags.push(`轉蛋券 ${resources.tickets}張`);
      return;
    }

    // Check if it is a Coin token e.g. Coin30
    const coinMatch = tok.match(/^coin(\d+)$/i);
    if (coinMatch) {
      resources.coins = `${coinMatch[1]}金幣`;
      tags.push(`金幣 ${coinMatch[1]}`);
      return;
    }

    // Check if it is an account numerical code e.g. 0003668 or 0014114
    if (/^\d{5,}$/.test(tok)) {
      if (!displayId || tok.startsWith('00')) {
        displayId = tok;
      }
      return;
    }

    // Check if it is an eFootball hash/code or internal serial
    if (gameKey === 'efootball' && /^[a-z]{2,8}\d{6,}$/i.test(tok)) {
      if (!displayId) displayId = tok;
      return;
    }

    // Look up character
    const found = charLookup[lowerTok];
    const collabInfo = COLLAB_MAPPING[lowerTok];

    if (found) {
      const charId = found.name || tok;
      const chName = collabInfo?.chineseName || found.chineseName || (gameKey === 'cookierun' ? COOKIERUN_CHINESE[lowerTok] : undefined);
      const collabName = collabInfo?.collab;

      if (collabName) {
        collabSet.add(collabName);
      }

      if (charMap.has(charId)) {
        const existing = charMap.get(charId)!;
        existing.count += 1;
      } else {
        charMap.set(charId, {
          id: charId,
          name: found.name || tok,
          chineseName: chName,
          img: getCleanImageUrl(found.img, targetOrigin),
          category: found.category || (tok.includes('(P)') ? 'Pet' : tok.includes('(TS)') ? 'Treasure' : 'Character'),
          count: 1,
          featured: Boolean(found.featured),
          collab: collabName,
        });
      }
    } else if (collabInfo) {
      const charId = tok;
      collabSet.add(collabInfo.collab);
      if (charMap.has(charId)) {
        charMap.get(charId)!.count += 1;
      } else {
        charMap.set(charId, {
          id: charId,
          name: tok,
          chineseName: collabInfo.chineseName,
          img: getCleanImageUrl(`images/pic2/${tok}.png`, targetOrigin),
          count: 1,
          featured: true,
          collab: collabInfo.collab,
        });
      }
    } else {
      // Ignored noise or unmatched token
      if (!['line', 'cocos', 'pref', 'key'].includes(lowerTok)) {
        unmatched.push(tok);
      }
    }
  });

  if (!displayId) {
    displayId = `ID-${String(index + 1).padStart(5, '0')}`;
  }

  const characters = Array.from(charMap.values());
  const characterCount = characters.reduce((sum, c) => sum + c.count, 0);
  const collabSeries = Array.from(collabSet);

  if (collabSeries.length > 0) {
    tags.push(...collabSeries);
  }

  return {
    id: rawId,
    rawString: rawId,
    displayId,
    index,
    gameKey,
    characters,
    characterCount,
    collabSeries,
    resources,
    unmatched,
    tags,
    selected: false,
  };
}

// Generate Copy-Paste text formatted for various platforms
export function formatAccountsToText(
  accounts: InventoryAccount[],
  config: ExportTemplateConfig
): string {
  if (!accounts || accounts.length === 0) return '';

  const {
    preset,
    includeId,
    includeGameName,
    includeCollabs,
    includeCharacters,
    includeResources,
    includeCustomPrice,
    includeContact,
    shopTitle,
    contactLine,
    customTemplateString,
  } = config;

  const header = shopTitle ? `🔥【${shopTitle}】🔥\n📅 更新時間: ${new Date().toLocaleDateString('zh-TW')}\n━━━━━━━━━━━━━━━━━━\n` : '';
  const footer = includeContact && contactLine ? `\n━━━━━━━━━━━━━━━━━━\n💬 詢問/購買方式: ${contactLine}\n⚡ 現貨秒發 · 安全有保障` : '';

  if (preset === 'custom' && customTemplateString) {
    const rows = accounts.map((acc, i) => {
      const charListStr = acc.characters
        .map((c) => `${c.chineseName || c.name}${c.count > 1 ? `x${c.count}` : ''}`)
        .join(', ');
      const collabStr = acc.collabSeries.join(' / ');
      const resList: string[] = [];
      if (acc.resources.stage) resList.push(`關卡:${acc.resources.stage}`);
      if (acc.resources.rubies) resList.push(`紅寶石:${acc.resources.rubies}`);
      if (acc.resources.tickets) resList.push(`轉蛋券:${acc.resources.tickets}`);
      if (acc.resources.coins) resList.push(`金幣:${acc.resources.coins}`);

      return customTemplateString
        .replace(/\{num\}/g, String(i + 1))
        .replace(/\{id\}/g, acc.displayId)
        .replace(/\{name\}/g, acc.customName || `編號 #${acc.displayId}`)
        .replace(/\{game\}/g, acc.gameKey)
        .replace(/\{characters\}/g, charListStr || '標準配置')
        .replace(/\{collabs\}/g, collabStr ? `[${collabStr}]` : '')
        .replace(/\{resources\}/g, resList.join(' ') || '無特殊資源')
        .replace(/\{price\}/g, acc.customPrice ? `NT$ ${acc.customPrice}` : '私訊問價')
        .replace(/\{raw\}/g, acc.rawString);
    });
    return `${header}${rows.join('\n')}${footer}`;
  }

  if (preset === 'line_bullet') {
    const lines = accounts.map((acc, i) => {
      const charSummary = acc.characters
        .map((c) => `${c.chineseName || c.name}${c.count > 1 ? `(x${c.count})` : ''}`)
        .join(' + ');

      const titleBadge = acc.customName ? `🏷️【${acc.customName}】` : acc.collabSeries.length > 0 ? `🌟【${acc.collabSeries.join(' | ')}】` : '';
      const resBadge = [];
      if (acc.resources.rubies) resBadge.push(`💎紅寶石:${acc.resources.rubies}`);
      if (acc.resources.tickets) resBadge.push(`🎫轉蛋券:${acc.resources.tickets}`);
      if (acc.resources.stage) resBadge.push(`🚩進度:${acc.resources.stage}關`);

      const priceStr = includeCustomPrice && acc.customPrice ? ` | 💰NT$${acc.customPrice}` : '';

      return `🔹 [編號 #${acc.displayId}] ${titleBadge}\n   👉 角色陣容: ${charSummary || '請洽客服確認細節'}${resBadge.length > 0 ? `\n   📦 內含資源: ${resBadge.join(' | ')}` : ''}${priceStr}`;
    });
    return `${header}📋【精選庫存清單 · 共 ${accounts.length} 組】\n\n${lines.join('\n\n')}${footer}`;
  }

  if (preset === 'discord_box') {
    const lines = accounts.map((acc, i) => {
      const charSummary = acc.characters
        .map((c) => `${c.chineseName || c.name}${c.count > 1 ? `*${c.count}` : ''}`)
        .join(', ');
      const titleTag = acc.customName ? `[${acc.customName}] ` : acc.collabSeries.length > 0 ? `[${acc.collabSeries[0]}] ` : '';
      const resStr = [
        acc.resources.stage ? `S${acc.resources.stage}` : '',
        acc.resources.rubies ? `RB:${acc.resources.rubies}` : '',
        acc.resources.tickets ? `TK:${acc.resources.tickets}` : '',
      ]
        .filter(Boolean)
        .join(' ');

      return `#${String(i + 1).padStart(2, '0')} | [ID:${acc.displayId}] ${titleTag}${charSummary}${resStr ? ` | ${resStr}` : ''}${includeCustomPrice && acc.customPrice ? ` | NT$${acc.customPrice}` : ''}`;
    });
    return `\`\`\`markdown\n# === ${shopTitle || '遊戲帳號現貨清單'} (總計: ${accounts.length}組) ===\n\n${lines.join('\n')}\n\`\`\`${footer}`;
  }

  if (preset === 'forum_8591') {
    const rows = accounts.map((acc, i) => {
      const charSummary = acc.characters
        .map((c) => `${c.chineseName || c.name}${c.count > 1 ? `x${c.count}` : ''}`)
        .join('、');
      const title = acc.customName ? `[${acc.customName}]` : acc.collabSeries.length > 0 ? `[${acc.collabSeries.join('、')}]` : '[現貨]';
      const price = includeCustomPrice && acc.customPrice ? `NT$ ${acc.customPrice}` : '私訊報價';
      return `【#${acc.displayId}】 ${title} 內容：${charSummary || '詳見代號'} | 價格：${price}`;
    });
    return `【現貨在庫】8591 / 賣場快速提問編號：\n\n${rows.join('\n')}\n\n👉 看中哪組直接私訊編號即可！`;
  }

  if (preset === 'compact_csv') {
    const headerRow = '編號,自訂標題,遊戲,聯動標籤,包含角色,關卡,紅寶石,轉蛋券,自訂售價,原始代碼';
    const dataRows = accounts.map((acc) => {
      const chars = `"${acc.characters.map((c) => `${c.chineseName || c.name}${c.count > 1 ? `x${c.count}` : ''}`).join(';')}"`;
      const collabs = `"${acc.collabSeries.join(';')}"`;
      const customTitle = `"${acc.customName || ''}"`;
      return `${acc.displayId},${customTitle},${acc.gameKey},${collabs},${chars},${acc.resources.stage || ''},${acc.resources.rubies || ''},${acc.resources.tickets || ''},${acc.customPrice || ''},"${acc.rawString}"`;
    });
    return [headerRow, ...dataRows].join('\n');
  }

  // Default clean table / social emoji
  const defaultLines = accounts.map((acc, i) => {
    const chars = acc.characters
      .map((c) => `${c.chineseName || c.name}${c.count > 1 ? `(x${c.count})` : ''}`)
      .join(' + ');
    const titleTag = acc.customName ? `🏷️【${acc.customName}】` : acc.collabSeries.length > 0 ? `👑【${acc.collabSeries.join(' & ')}】` : '⭐';
    return `${titleTag} 編號 #${acc.displayId}\n▫️ 角色: ${chars || '全套'}${acc.resources.rubies ? `\n▫️ 寶石: ${acc.resources.rubies}` : ''}${includeCustomPrice && acc.customPrice ? `\n▫️ 售價: NT$ ${acc.customPrice}` : ''}`;
  });

  return `${header}${defaultLines.join('\n\n')}${footer}`;
}
