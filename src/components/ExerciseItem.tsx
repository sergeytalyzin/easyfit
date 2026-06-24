import type { Exercise } from '../types'
import { Card } from './Card'
import { Button } from './Button'
import { SetRow } from './SetRow'
import styles from './ExerciseItem.module.css'

interface Props {
  exercise: Exercise
  onRename: (name: string) => void
  onDelete: () => void
  onAddSet: () => void
  onUpdateSet: (setId: string, patch: { weight?: number; reps?: number }) => void
  onDeleteSet: (setId: string) => void
}

export function ExerciseItem({
  exercise,
  onRename,
  onDelete,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
}: Props) {
  return (
    <Card className={`${styles.card} appear`}>
      <div className={styles.header}>
        <input
          className={styles.name}
          value={exercise.name}
          placeholder="Упражнение"
          onChange={(e) => onRename(e.target.value)}
        />
        <button className={styles.remove} onClick={onDelete} aria-label="Удалить упражнение">
          ✕
        </button>
      </div>

      {exercise.sets.length > 0 && (
        <div className={styles.sets}>
          {exercise.sets.map((set, i) => (
            <SetRow
              key={set.id}
              index={i}
              set={set}
              onChange={(patch) => onUpdateSet(set.id, patch)}
              onDelete={() => onDeleteSet(set.id)}
            />
          ))}
        </div>
      )}

      <Button variant="secondary" full onClick={onAddSet} className={styles.addSet}>
        + подход
      </Button>
    </Card>
  )
}
