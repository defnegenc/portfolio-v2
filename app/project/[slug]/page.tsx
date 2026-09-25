import { notFound } from 'next/navigation'
import PageShell from '@/components/PageShell'
import { PROJECTS, ALL_SLUGS, KIND } from '../data'
import ProjectView from './ProjectView'

/* A project page, drawn the way the homepage is: solid panels and walls over
   one continuous field, a ruled table for the facts, and a path bar for getting
   around. The data lives in ../data.ts; the drawing in ProjectView. */

export function generateStaticParams() {
  return ALL_SLUGS.map(slug => ({ slug }))
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = PROJECTS[slug]
  // unlisted projects keep their data but are not reachable
  if (!project || !ALL_SLUGS.includes(slug)) notFound()

  const listing = ALL_SLUGS.map(s => ({
    slug: s, name: PROJECTS[s].name, kind: KIND[s] ?? '', year: PROJECTS[s].year,
    award: s === 'bloom' ? 'CHI 2026 Best Paper' : undefined,
  }))

  return (
    <PageShell here="project" field="none" accent={project.accentColor}>
      <ProjectView project={project} listing={listing} />
    </PageShell>
  )
}
