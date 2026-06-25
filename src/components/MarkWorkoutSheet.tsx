import { useEffect, useState } from 'react'
import { BottomSheet } from './BottomSheet'
import { Button } from './Button'
import { Calendar } from './Calendar'
import { dayKey } from '../utils/date'
import type { Workout } from '../types'
import styles from './MarkWorkoutSheet.module.css'

interface Props {
  open: boolean
  onClose: () => void
  templates: Workout[]
  markedKeys: Set<string>
  onSave: (template: Workout, dayKeyValue: string) => void
}

// Отметить выполненную тренировку: выбрать дату в календаре, выбрать шаблон,
// сохранить. Календарь живёт внутри шита, поэтому не мешает на экране.
export function MarkWorkoutSheet({
  open,
  onClose,
  templates,
  markedKeys,
  onSave,
}: Props) {
  const [selectedDate, setSelectedDate] = useState(() => dayKey(new Date()))
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // При каждом открытии — дата по умолчанию сегодня, выбор сброшен.
  useEffect(() => {
    if (open) {
      setSelectedDate(dayKey(new Date()))
      setSelectedId(null)
    }
  }, [open])

  function save() {
    const template = templates.find((t) => t.id === selectedId)
    if (!template) return
    onSave(template, selectedDate)
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <h2 className={styles.title}>Отметить тренировку</h2>

      <Calendar
        flat
        selectedKey={selectedDate}
        markedKeys={markedKeys}
        onSelect={setSelectedDate}
      />

      {templates.length === 0 ? (
        <p className={styles.empty}>Сначала создайте шаблон тренировки.</p>
      ) : (
        <div className={styles.list}>
          {templates.map((t) => {
            const active = t.id === selectedId
            return (
              <button
                key={t.id}
                className={`${styles.row} ${active ? styles.rowActive : ''}`}
                onClick={() => setSelectedId(t.id)}
              >
                <span className={styles.radio}>{active ? '●' : ''}</span>
                <span className={styles.name}>{t.name}</span>
                <span className={styles.count}>{t.exercises.length} упр.</span>
              </button>
            )
          })}
        </div>
      )}

      <Button full disabled={!selectedId} onClick={save}>
        Сохранить
      </Button>
    </BottomSheet>
  )
}
