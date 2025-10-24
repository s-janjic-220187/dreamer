import { TamaguiProvider } from '@tamagui/core'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { Layout } from './components'
import { AIInsightsPage, DreamDetailPage, DreamsPage, EditDreamPage, HomePage, NewDreamPage } from './pages'
import { config } from './tamagui.config'

function App() {
  return (
    <TamaguiProvider config={config}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dreams" element={<DreamsPage />} />
            <Route path="/dreams/new" element={<NewDreamPage />} />
            <Route path="/dreams/:id/edit" element={<EditDreamPage />} />
            <Route path="/dreams/:id" element={<DreamDetailPage />} />
            <Route path="/ai-insights" element={<AIInsightsPage />} />
          </Routes>
        </Layout>
      </Router>
    </TamaguiProvider>
  )
}

export default App
