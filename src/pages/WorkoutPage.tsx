import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useWorkoutsContext } from '../hooks/WorkoutsContext'
import { usePeopleContext } from '../hooks/PeopleContext'
import { ExerciseItem } from '../components/ExerciseItem'
import { Button } from '../components/Button'
import { CopyWorkoutSheet } from '../components/CopyWorkoutSheet'
import { formatDate } from '../utils/date'
import styles from './WorkoutPage.module.css'

export function WorkoutPage() {
  const { id = '', personId = '' } = useParams()
  const navigate = useNavigate()
  const backToPerson = `/person/${personId}`
  const [copyOpen, setCopyOpen] = useState(false)
  const { people } = usePeopleContext()
  const {
    workouts,
    updateWorkout,
    copyWorkout,
    deleteWorkout,
    addExercise,
    updateExercise,
    deleteExercise,
    addSet,
    updateSet,
    deleteSet,
  } = useWorkoutsContext()

  const workout = workouts.find((w) => w.id === id)

  if (!workout) {
    return (
      <div className={styles.page}>
        <button className={styles.back} onClick={() => navigate(backToPerson)}>
          ‹ Назад
        </button>
        <p className={styles.missing}>Тренировка не найдена.</p>
      </div>
    )
  }

  function onDeleteWorkout() {
    if (confirm('Удалить тренировку целиком?')) {
      deleteWorkout(workout!.id)
      navigate(backToPerson, { replace: true })
    }
  }

  function onCopyTo(targetPersonId: string) {
    const copy = copyWorkout(workout!.id, targetPersonId)
    setCopyOpen(false)
    if (copy) navigate(`/person/${targetPersonId}/workout/${copy.id}`)
  }

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate(backToPerson)}>
        ‹ Назад
      </button>

      <div className={styles.head}>
        <input
          className={styles.title}
          value={workout.name}
          placeholder="Название тренировки"
          onChange={(e) => updateWorkout(workout.id, { name: e.target.value })}
        />
        <div className={styles.date}>{formatDate(workout.date)}</div>
      </div>

      <div className={styles.exercises}>
        {workout.exercises.map((ex) => (
          <ExerciseItem
            key={ex.id}
            exercise={ex}
            onRename={(name) => updateExercise(workout.id, ex.id, name)}
            onDelete={() => deleteExercise(workout.id, ex.id)}
            onAddSet={() => addSet(workout.id, ex.id)}
            onUpdateSet={(setId, patch) => updateSet(workout.id, ex.id, setId, patch)}
            onDeleteSet={(setId) => deleteSet(workout.id, ex.id, setId)}
          />
        ))}
      </div>

      <Button full variant="secondary" onClick={() => addExercise(workout.id, '')}>
        + упражнение
      </Button>

      <Button full variant="secondary" onClick={() => setCopyOpen(true)}>
        ⧉ Копировать другому
      </Button>

      <button className={styles.deleteWorkout} onClick={onDeleteWorkout}>
        Удалить тренировку
      </button>

      <CopyWorkoutSheet
        open={copyOpen}
        onClose={() => setCopyOpen(false)}
        people={people}
        currentPersonId={personId}
        onPick={onCopyTo}
      />
    </div>
  )
}
