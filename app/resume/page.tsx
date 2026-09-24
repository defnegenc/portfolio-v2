'use client'

/* Résumé: the two-column sheet. Left rail carries education, publications,
   projects and skills; experience gets the wider column. The printable version
   is the PDF in public/, which the single action here downloads. No field on
   this page: it is a document, and the animation only competed with it. */

import PageShell from '@/components/PageShell'
import ResumeSheet from '@/components/ResumeSheet'

const PDF = '/defne-genc-resume.pdf'

const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const LinkedInIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M6.94 5.5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0ZM3.3 8.98h3.4V21H3.3V8.98Zm5.72 0h3.26v1.64h.05c.45-.86 1.56-1.77 3.22-1.77 3.44 0 4.08 2.27 4.08 5.22V21h-3.4v-5.33c0-1.27-.02-2.9-1.77-2.9-1.77 0-2.04 1.38-2.04 2.81V21H9.02V8.98Z" />
  </svg>
)

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M17.53 3h3.14l-6.86 7.84L21.88 21h-6.3l-4.94-6.45L4.98 21H1.84l7.34-8.39L1.5 3h6.46l4.47 5.9L17.53 3Zm-1.1 16.13h1.74L7.64 4.78H5.78l10.65 14.35Z" />
  </svg>
)

export default function Resume() {
  return (
    <PageShell here="resume" field="none">
      <style>{`
        .act { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.88rem; font-weight: 500; padding: 0.5rem 1.05rem; border-radius: 999px; cursor: pointer; border: 1px solid var(--hairline); background: transparent; color: var(--ink); font-family: inherit; text-decoration: none; transition: border-color .2s, color .2s, background .2s; }
        .act-primary { background: var(--ink); color: var(--bg); border-color: var(--ink); }
        .act-primary:hover { background: var(--award); border-color: var(--award); }
        .act:hover { border-color: var(--award); color: var(--award); }
        .act-primary:hover { color: var(--bg); }
        .ico { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 999px; color: var(--ink); border: 1px solid var(--hairline); transition: color .2s, border-color .2s; }
        .ico:hover { color: var(--award); border-color: var(--award); }
        @page { size: letter; margin: 0.5in; }
        @media print {
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          html, body, .shell { position: static !important; height: auto !important; overflow: visible !important; background: #fff !important; }
          [data-theme] { --bg: #fff !important; --ink: #111 !important; --ink-dim: #333 !important; --hairline: rgba(0,0,0,0.2) !important; --award: #013698 !important; }
          canvas, .no-print { display: none !important; }
          .shell > div:first-of-type { display: none !important; }
          .sheet { padding: 0 !important; max-width: none !important; }
        }
      `}</style>

      <div className="sheet" style={{ maxWidth: 1180, margin: '0 auto' }}>
        {/* socials sit left of the actions; the sheet itself carries no contact line */}
        <div className="no-print" style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '1.6rem' }}>
          <a className="ico" href="https://linkedin.com/in/-defne" target="_blank" rel="noreferrer" aria-label="LinkedIn" title="LinkedIn"><LinkedInIcon /></a>
          <a className="ico" href="https://x.com/defnozi" target="_blank" rel="noreferrer" aria-label="X" title="@defnozi"><XIcon /></a>
          <a className="act act-primary" href={PDF} download><DownloadIcon />Download résumé</a>
        </div>

        <ResumeSheet />
      </div>

    </PageShell>
  )
}
