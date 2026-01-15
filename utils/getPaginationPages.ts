export default function getPaginationPages(
  current: number,
  total: number
): (number | 'dots')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | 'dots')[] = []

  pages.push(1)

  if (current > 3) {
    pages.push('dots')
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 2) {
    pages.push('dots')
  }

  pages.push(total)

  return pages
}
