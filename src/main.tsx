import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Check, ExternalLink, Gift} from 'lucide-react';
import {BUDGETS, CATEGORIES, buildAmazonUrl, readSelection, selectionUrl} from './finder';
import './style.css';

function App() {
  const [selection, setSelection] = useState(() => readSelection(window.location.search));

  useEffect(() => {
    window.history.replaceState(window.history.state, '', selectionUrl(window.location.href, selection));
  }, [selection]);

  useEffect(() => {
    const restore = () => setSelection(readSelection(window.location.search));
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, []);

  return (
    <main className="mx-auto w-full max-w-[820px] px-4 py-8 sm:px-8 sm:py-12">
      <header className="mb-7 flex items-center gap-3 sm:mb-9 sm:gap-4">
        <div className="brand-icon flex size-12 shrink-0 items-center justify-center rounded-2xl sm:size-14">
          <Gift aria-hidden="true" size={27} strokeWidth={1.6} />
        </div>
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight sm:text-[27px]">忘年会 景品ファインダー</h1>
          <p className="mt-1.5 text-xs text-neutral-400 sm:text-sm">予算から、欲しいものを見つけよう。</p>
        </div>
      </header>

      <div className="finder-panel rounded-[26px] border border-neutral-700/80 p-5 sm:rounded-[30px] sm:p-9">
        <fieldset>
          <legend className="section-title">予算を選ぶ</legend>
          <div className="mt-4 flex flex-col gap-1">
            {BUDGETS.map(budget => (
              <label key={budget.id} className="budget-option flex min-h-11 w-fit cursor-pointer items-center gap-3 rounded-lg pr-4 text-[15px] sm:text-base">
                <input type="radio" name="budget" value={budget.id} checked={selection.budget.id === budget.id}
                  onChange={() => setSelection(current => ({...current, budget}))} />
                <span>{budget.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <hr className="my-6 border-0 border-t border-neutral-700/70 sm:my-7" />

        <fieldset>
          <legend className="section-title">気になるジャンル</legend>
          <div className="category-grid mt-5 grid grid-cols-3 gap-2.5 sm:gap-3">
            {CATEGORIES.map(category => (
              <label key={category.id} className="category-option relative cursor-pointer">
                <input className="peer sr-only" type="radio" name="category" value={category.id}
                  checked={selection.category.id === category.id}
                  onChange={() => setSelection(current => ({...current, category}))} />
                <span className="category-card flex min-h-[98px] flex-col items-center justify-center gap-2 rounded-2xl border border-neutral-700 text-[12px] transition-colors peer-checked:border-neutral-100 peer-checked:bg-neutral-950 peer-checked:shadow-[inset_0_0_0_1px_#f5f5f5] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-white sm:min-h-[108px] sm:text-sm">
                  <span aria-hidden="true" className="text-[25px] leading-8">{category.emoji}</span>
                  <span>{category.label}{category.id === 'any' && <span className="ml-1 text-[10px] text-neutral-400">(ギフト)</span>}</span>
                </span>
                {selection.category.id === category.id && <Check aria-hidden="true" size={13} className="pointer-events-none absolute right-3 top-3 text-neutral-200" />}
              </label>
            ))}
          </div>
        </fieldset>

        <a href={buildAmazonUrl(selection)} target="_blank" rel="noopener noreferrer"
          className="amazon-button mt-7 flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-neutral-100 px-4 text-sm font-semibold text-neutral-950 transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:scale-[0.99] sm:text-base">
          Amazonで景品を探す <ExternalLink aria-hidden="true" size={17} strokeWidth={1.8} />
        </a>
      </div>

      <footer className="mt-6 space-y-1.5 px-1 text-[11px] leading-relaxed text-neutral-400 sm:px-2 sm:text-xs">
        <p>※ 金券・ギフト券・サービス券は景品の対象外です。</p>
        <p>※ 商品の価格や在庫はAmazonの商品ページでご確認ください。</p>
        <p>※ Amazonの検索結果に対象外の商品が含まれる場合があります。</p>
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
