import { BottomSheet } from './BottomSheet'
import type { Workout } from '../types'
import styles from './TemplatePickerSheet.module.css'

interface Props {
  open: boolean
  onClose: () => void
  dateLabel: string
  templates: Workout[]
  onPick: (template: Workout) => void
}

// Выбор шаблона, который отмечаем выполненным на выбранную дату.
export function TemplatePickerSheet({
  open,
  onClose,
  dateLabel,
  templates,
  onPick,
}: Props) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <h2 className={styles.title}>Какую тренировку сделали?</h2>
      <p className={styles.date}>{dateLabel}</p>

      {templates.length === 0 ? (
        <p className={styles.empty}>
          Сначала создайте шаблон тренировки выше.
        </p>
      ) : (
        <div className={styles.list}>
          {templates.map((t) => (
            <button key={t.id} className={styles.row} onClick={() => onPick(t)}>
              <span className={styles.name}>{t.name}</span>
              <span className={styles.count}>{t.exercises.length} упр.</span>
            </button>
          ))}
        </div>
      )}
    </BottomSheet>
  )
}
