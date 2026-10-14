import { useEffect } from 'react'
import {
  HashRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { PeopleProvider, usePeopleContext } from './hooks/PeopleContext'
import { WorkoutsProvider } from './hooks/WorkoutsContext'
import { CompletedWorkoutsProvider } from './hooks/CompletedWorkoutsContext'
import { PeoplePage } from './pages/PeoplePage'
import { PersonPage } from './pages/PersonPage'
import { NewWorkoutPage } from './pages/NewWorkoutPage'
import { WorkoutPage } from './pages/WorkoutPage'
import { ProgressPage } from './pages/ProgressPage'
import { CompletedWorkoutPage } from './pages/CompletedWorkoutPage'

// Срабатывает один раз за загрузку страницы: если выбран основной человек
// и он существует — сразу открываем его профиль вместо экрана «Люди».
// Флаг на уровне модуля не даёт повторного редиректа при навигации назад.
let didInitialRedirect = false
function InitialFavoriteRedirect() {
  const { people, favoriteId } = usePeopleContext()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (didInitialRedirect) return
    didInitialRedirect = true
    if (location.pathname !== '/') return // не мешаем прямым ссылкам
    if (favoriteId && people.some((p) => p.id === favoriteId)) {
      navigate(`/person/${favoriteId}`, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

export default function App() {
  return (
    <PeopleProvider>
      <WorkoutsProvider>
        <CompletedWorkoutsProvider>
          <HashRouter>
            <InitialFavoriteRedirect />
            <main className="container">
              <Routes>
                <Route path="/" element={<PeoplePage />} />
                <Route path="/person/:personId" element={<PersonPage />} />
                <Route path="/person/:personId/new" element={<NewWorkoutPage />} />
                <Route
                  path="/person/:personId/progress"
                  element={<ProgressPage />}
                />
                <Route
                  path="/person/:personId/completed/:logId"
                  element={<CompletedWorkoutPage />}
                />
                <Route
                  path="/person/:personId/workout/:id"
                  element={<WorkoutPage />}
                />
                <Route path="*" element={<PeoplePage />} />
              </Routes>
            </main>
          </HashRouter>
        </CompletedWorkoutsProvider>
      </WorkoutsProvider>
    </PeopleProvider>
  )
}
