'use client'

/* The nav: a plain hamburger.

   Three rules of equal width, folding into an X. Nothing clever. Open,
   the links unfold along the strip itself rather than covering the page,
   entering from the right, and the label becomes Close.

   Below 620px the row would not fit, so it falls back to a sheet under the
   strip. */

import Link from 'next/link'

export type NavItem = { label: string; href?: string; action?: () => void; here?: boolean }

const RULES = [18, 18, 18]   // bar widths, px

export default function NavMenu({ items, open, setOpen }: { items: NavItem[]; open: boolean; setOpen: (v: boolean) => void }) {
  return (
    <div className="nav-menu" data-open={open ? 1 : 0}>
      <style>{`
        .nav-menu { position: relative; display: flex; align-items: center; min-width: 0; }
        /* The row is taken out of flow and never resized: animating max-width
           forced a reflow every frame, which is what made this stutter. Only
           opacity and transform move now, both compositor-only. */
        .nav-row {
          position: absolute; right: 100%; top: 50%; margin-right: 0.7rem;
          display: flex; align-items: center; gap: 1.1rem;
          transform: translateY(-50%);
          pointer-events: none;
        }
        .nav-item {
          font-size: 0.82rem; color: var(--ink-dim); text-decoration: none; white-space: nowrap;
          background: none; border: none; padding: 0; font-family: inherit; cursor: pointer;
          opacity: 0; transform: translateX(10px);
          transition: opacity .3s ease, transform .45s cubic-bezier(.19,1,.22,1), color .2s;
        }
        .nav-menu[data-open="1"] .nav-row { pointer-events: auto; }
        .nav-menu[data-open="1"] .nav-item { opacity: 1; transform: translateX(0); }
        .nav-item:hover { color: var(--award); }
        .nav-item[data-here="1"] { color: var(--ink); }

        /* The tile crop is a nice mark but a poor signifier, so it is labelled.
           The word does the telling; the tiles do the belonging. */
        .nav-mark {
          display: flex; align-items: center; gap: 0.5rem;
          background: none; border: none; padding: 4px; cursor: pointer; flex-shrink: 0;
          color: var(--ink); transition: color .2s;
        }
        .nav-mark:hover, .nav-menu[data-open="1"] .nav-mark { color: var(--award); }
        .nav-bars { display: flex; flex-direction: column; gap: 4px; align-items: flex-start; flex-shrink: 0; }
        .nav-bars span {
          display: block; height: 2px; border-radius: 999px; background: currentColor;
          transition: transform .3s cubic-bezier(.19,1,.22,1), opacity .2s;
        }
        .nav-menu[data-open="1"] .nav-bars span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
        .nav-menu[data-open="1"] .nav-bars span:nth-child(2) { opacity: 0; }
        .nav-menu[data-open="1"] .nav-bars span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

        @media (max-width: 620px) {
          .nav-row {
            right: 0; top: 100%; z-index: 60;
            flex-direction: column; align-items: flex-end; gap: 0.5rem;
            width: max-content; margin-right: 0; margin-top: 0.4rem;
            transform: none;
            background: var(--bg); border: 1px solid var(--hairline); border-radius: 10px;
            padding: 0.75rem 0.9rem;
            opacity: 0; transition: opacity .25s ease;
          }
          .nav-menu[data-open="1"] .nav-row { opacity: 1; }
        }
      `}</style>

      {/* links first in the DOM so they unfold to the left of the mark */}
      <div className="nav-row" aria-hidden={!open}>
        {items.map(({ label, href, action, here }, i) => {
          // stagger outward from the mark on the way in, and back toward it on the way out
          const n = items.length
          const style = { transitionDelay: open ? `${(n - 1 - i) * 40}ms` : `${i * 25}ms` }
          if (action) {
            return (
              <button key={label} className="nav-item" style={style} tabIndex={open ? 0 : -1} onClick={action}>
                {label}
              </button>
            )
          }
          const external = href?.startsWith('http')
          if (external) {
            return (
              <a key={label} className="nav-item" style={style} tabIndex={open ? 0 : -1}
                href={href} target="_blank" rel="noreferrer">{label}</a>
            )
          }
          return (
            <Link key={label} className="nav-item" data-here={here ? 1 : 0} style={style}
              tabIndex={open ? 0 : -1} href={href ?? '/'}>{label}</Link>
          )
        })}
      </div>

      <button className="nav-mark" onClick={() => setOpen(!open)}
        aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'}>
        <span className="nav-bars">
          {RULES.map((w, i) => <span key={i} style={{ width: w }} />)}
        </span>
      </button>
    </div>
  )
}
