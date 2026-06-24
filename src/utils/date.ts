// Форматирование даты для отображения в карточках тренировок.
export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  })
}
