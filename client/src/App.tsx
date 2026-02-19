import { Provider } from 'react-redux'
import { store } from '@/store'
import AppRouter from '@/routes'
import ErrorBoundary from '@/components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AppRouter />
      </Provider>
    </ErrorBoundary>
  )
}

export default App
