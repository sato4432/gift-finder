export const BUDGETS = [
  {id: '1001-5000', min: 1001, max: 5000, label: '1,001〜5,000円'},
  {id: '5001-10000', min: 5001, max: 10000, label: '5,001〜10,000円'},
  {id: '10001-30000', min: 10001, max: 30000, label: '10,001〜30,000円'},
  {id: '30001-60000', min: 30001, max: 60000, label: '30,001〜60,000円'},
  {id: '60001-100000', min: 60001, max: 100000, label: '60,001〜100,000円'},
] as const;

export const CATEGORIES = [
  {id: 'electronics', label: '家電', keyword: '家電', emoji: '🔌'},
  {id: 'gadgets', label: 'ガジェット', keyword: 'ガジェット', emoji: '📱'},
  {id: 'games', label: 'ゲーム', keyword: 'ゲーム', emoji: '🎮'},
  {id: 'food', label: '食品', keyword: 'お取り寄せ グルメ', emoji: '🍖'},
  {id: 'household', label: '生活雑貨', keyword: '生活雑貨', emoji: '🏠'},
  {id: 'beauty', label: '美容家電', keyword: '美容家電', emoji: '✨'},
  {id: 'outdoor', label: 'アウトドア', keyword: 'アウトドア', emoji: '⛺'},
  {id: 'fashion', label: 'ファッション', keyword: 'ファッション', emoji: '👕'},
  // Empty-keyword search did not show a reliable price filter. Label the fallback explicitly.
  {id: 'any', label: 'おまかせ', keyword: 'ギフト', emoji: '🎁'},
] as const;

export type Budget = (typeof BUDGETS)[number];
export type Category = (typeof CATEGORIES)[number];
export type Selection = {budget: Budget; category: Category};

export function readSelection(search: string): Selection {
  const params = new URLSearchParams(search);
  return {
    budget: BUDGETS.find(({id}) => id === params.get('budget')) ?? BUDGETS[0],
    category: CATEGORIES.find(({id}) => id === params.get('category')) ?? CATEGORIES[0],
  };
}

export function selectionUrl(currentUrl: string, {budget, category}: Selection): string {
  const url = new URL(currentUrl);
  url.searchParams.set('budget', budget.id);
  url.searchParams.set('category', category.id);
  return url.href;
}

export function buildAmazonUrl({budget, category}: Selection): string {
  const url = new URL('https://www.amazon.co.jp/s');
  url.search = new URLSearchParams({
    k: category.keyword,
    'low-price': String(budget.min),
    'high-price': String(budget.max),
  }).toString();
  return url.href;
}
