import { HashRouter, Route, Routes } from 'react-router-dom'
import { PeopleProvider } from './hooks/PeopleContext'
import { WorkoutsProvider } from './hooks/WorkoutsContext'
import { PeoplePage } from './pages/PeoplePage'
import { PersonPage } from './pages/PersonPage'
import { NewWorkoutPage } from './pages/NewWorkoutPage'
import { WorkoutPage } from './pages/WorkoutPage'

export default function App() {
  return (
    <PeopleProvider>
      <WorkoutsProvider>
        <HashRouter>
          <main className="container">
            <Routes>
              <Route path="/" element={<PeoplePage />} />
              <Route path="/person/:personId" element={<PersonPage />} />
              <Route path="/person/:personId/new" element={<NewWorkoutPage />} />
              <Route
                path="/person/:personId/workout/:id"
                element={<WorkoutPage />}
              />
              <Route path="*" element={<PeoplePage />} />
            </Routes>
          </main>
        </HashRouter>
      </WorkoutsProvider>
    </PeopleProvider>
  )
}
