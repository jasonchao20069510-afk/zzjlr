// Sync Service with robust multi-tier fallback (Direct Remote Fetch -> Server API -> LocalStorage Cache)

const TARGET_ORIGIN = 'https://ledger-live-nine.vercel.app';
const CACHE_STORAGE_KEY = 'line_rangers_inventory_cache_v2';

export interface SyncResult {
  success: boolean;
  gameData: any;
  accounts: {
    linerangers?: string[];
    kaibee?: string[];
    [key: string]: string[] | undefined;
  };
  timestamp: number;
  source: 'server_api' | 'direct_client' | 'local_cache';
  error?: string;
}

// Deep clean gameData to strip all price properties
function sanitizeGameData(raw: any) {
  if (!raw) return {};
  try {
    const copy = JSON.parse(JSON.stringify(raw));
    delete copy.comboPrices;
    delete copy.duplicateBulkPrices;
    delete copy.discountPercentByGame;
    if (copy.premium) {
      delete copy.premium.price;
    }
    if (copy.characters) {
      Object.keys(copy.characters).forEach((cat) => {
        if (Array.isArray(copy.characters[cat])) {
          copy.characters[cat] = copy.characters[cat].map((char: any) => {
            const { price, ...rest } = char;
            return rest;
          });
        }
      });
    }
    return copy;
  } catch {
    return raw;
  }
}

// Fetch directly from remote origin from client browser
async function fetchDirectlyFromRemote(): Promise<SyncResult> {
  // 1. Fetch game-data.json
  const gameDataRes = await fetch(`${TARGET_ORIGIN}/game-data.json`, {
    headers: { 'Accept': 'application/json' },
    cache: 'no-store',
  });
  
  if (!gameDataRes.ok) {
    throw new Error(`Direct game-data.json fetch failed: HTTP ${gameDataRes.status}`);
  }
  
  const text = await gameDataRes.text();
  let rawGameData: any = {};
  try {
    rawGameData = JSON.parse(text);
  } catch {
    throw new Error('遠端 game-data.json 格式異常');
  }
  
  const sanitizedGameData = sanitizeGameData(rawGameData);

  // 2. Fetch linerangers & kaibee account IDs
  const games = ['linerangers', 'kaibee'];
  const accounts: Record<string, string[]> = {};

  await Promise.all(
    games.map(async (g) => {
      try {
        const res = await fetch(`${TARGET_ORIGIN}/api/xml-files?game=${g}`, {
          headers: { 'Accept': 'application/json' },
          cache: 'no-store',
        });
        if (res.ok) {
          const resText = await res.text();
          try {
            const data = JSON.parse(resText);
            accounts[g] = data.ids || [];
          } catch {
            accounts[g] = [];
          }
        } else {
          accounts[g] = [];
        }
      } catch (err) {
        console.warn(`Direct fetch for ${g} warning:`, err);
        accounts[g] = [];
      }
    })
  );

  return {
    success: true,
    gameData: sanitizedGameData,
    accounts,
    timestamp: Date.now(),
    source: 'direct_client',
  };
}

export async function fetchFullInventory(): Promise<SyncResult> {
  // Strategy: Prioritize Direct Remote Fetch on Vercel/Static deployments for instant response and CORS support
  try {
    const directResult = await fetchDirectlyFromRemote();
    if (directResult.success && directResult.accounts) {
      saveToCache(directResult);
      return directResult;
    }
  } catch (directErr) {
    console.warn('Direct client fetch failed, trying local API /api/inventory/sync fallback...', directErr);
  }

  // Tier 2: Try local backend API if available
  try {
    const res = await fetch('/api/inventory/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ targetUrl: TARGET_ORIGIN }),
    });

    if (res.ok) {
      const rawText = await res.text();
      try {
        const data = JSON.parse(rawText);
        if (data.success && data.accounts) {
          const result: SyncResult = {
            success: true,
            gameData: data.gameData,
            accounts: data.accounts,
            timestamp: data.timestamp || Date.now(),
            source: 'server_api',
          };
          saveToCache(result);
          return result;
        }
      } catch (jsonErr) {
        console.warn('API returned non-JSON response (e.g. 404 HTML)', jsonErr);
      }
    }
  } catch (serverErr) {
    console.warn('Server API /api/inventory/sync not reachable:', serverErr);
  }

  // Tier 3: Local Cache fallback
  const cached = loadFromCache();
  if (cached) {
    return {
      ...cached,
      source: 'local_cache',
    };
  }

  throw new Error('無法連線至遊戲庫存伺服器，請確認網路連線或稍後重試');
}

function saveToCache(result: SyncResult) {
  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify({
      gameData: result.gameData,
      accounts: result.accounts,
      timestamp: result.timestamp,
    }));
  } catch {
    // ignore
  }
}

function loadFromCache(): SyncResult | null {
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.gameData && parsed.accounts) {
      return {
        success: true,
        gameData: parsed.gameData,
        accounts: parsed.accounts,
        timestamp: parsed.timestamp || Date.now(),
        source: 'local_cache',
      };
    }
  } catch {
    // ignore
  }
  return null;
}
