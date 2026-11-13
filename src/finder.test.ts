import {describe, expect, it} from 'vitest';
import {BUDGETS, CATEGORIES, buildAmazonUrl, readSelection, selectionUrl} from './finder';

describe('選択肢の定義', () => {
  it('5つの予算が重複や隙間なく1,001〜100,000円をカバーする', () => {
    expect(BUDGETS.map(({min, max}) => [min, max])).toEqual([
      [1001, 5000], [5001, 10000], [10001, 30000], [30001, 60000], [60001, 100000],
    ]);
    expect(new Set(BUDGETS.map(({id}) => id)).size).toBe(5);
  });
  it('9ジャンルが指定された順序とキーワードで定義される', () => {
    expect(CATEGORIES.map(({label}) => label)).toEqual(['家電', 'ガジェット', 'ゲーム', '食品', '生活雑貨', '美容家電', 'アウトドア', 'ファッション', 'おまかせ']);
    expect(CATEGORIES.map(({keyword}) => keyword)).toEqual(['家電', 'ガジェット', 'ゲーム', 'お取り寄せ グルメ', '生活雑貨', '美容家電', 'アウトドア', 'ファッション', 'ギフト']);
    expect(new Set(CATEGORIES.map(({id}) => id)).size).toBe(9);
  });
});

describe('Amazon検索リンク', () => {
  for (const budget of BUDGETS) {
    for (const category of CATEGORIES) {
      it(`${budget.label}・${category.label}の価格とキーワードを設定する`, () => {
        const url = new URL(buildAmazonUrl({budget, category}));
        expect(url.origin).toBe('https://www.amazon.co.jp');
        expect(url.pathname).toBe('/s');
        expect(url.searchParams.get('low-price')).toBe(String(budget.min));
        expect(url.searchParams.get('high-price')).toBe(String(budget.max));
        expect(url.searchParams.get('k')).toBe(category.keyword);
        expect([...url.searchParams.keys()].sort()).toEqual(['high-price', 'k', 'low-price']);
      });
    }
  }
  it('日本語・空白をURLエンコードし、元のキーワードへ復元できる', () => {
    const link = buildAmazonUrl({budget: BUDGETS[0], category: CATEGORIES[3]});
    expect(link).not.toContain('お取り寄せ');
    expect(link).toContain(encodeURIComponent('お取り寄せ'));
    expect(new URL(link).searchParams.get('k')).toBe('お取り寄せ グルメ');
  });
  it('おまかせは空検索ではなく明示したギフト検索になる', () => {
    expect(new URL(buildAmazonUrl({budget: BUDGETS[0], category: CATEGORIES[8]})).searchParams.get('k')).toBe('ギフト');
  });
});

describe('URLによる選択状態の保存・復元', () => {
  it('すべての有効な組み合わせを往復でき、サブパス・他のクエリ・ハッシュを保つ', () => {
    for (const budget of BUDGETS) for (const category of CATEGORIES) {
      const url = new URL(selectionUrl('https://example.com/gift-finder/?other=keep#finder', {budget, category}));
      expect(url.pathname).toBe('/gift-finder/');
      expect(url.hash).toBe('#finder');
      expect(url.searchParams.get('other')).toBe('keep');
      expect(readSelection(url.search)).toEqual({budget, category});
    }
  });
  it.each(['', '?budget=nope&category=unknown', '?budget=&category=', '?budget=__proto__&category=constructor', '?budget=%3Cscript%3E&category=%E0%A4%A'])('無効または未指定の値をデフォルトへ戻す: %s', search => {
    expect(readSelection(search)).toEqual({budget: BUDGETS[0], category: CATEGORIES[0]});
  });
  it('無効な値だけを個別にデフォルトへ戻す', () => {
    expect(readSelection('?budget=invalid&category=food')).toEqual({budget: BUDGETS[0], category: CATEGORIES[3]});
    expect(readSelection('?budget=5001-10000&category=invalid')).toEqual({budget: BUDGETS[1], category: CATEGORIES[0]});
  });
  it('同じ名前のパラメータを増やさず更新する', () => {
    const url = new URL(selectionUrl('https://example.com/gift-finder/?budget=invalid&budget=duplicate', {budget: BUDGETS[1], category: CATEGORIES[1]}));
    expect(url.searchParams.getAll('budget')).toEqual(['5001-10000']);
  });
});
