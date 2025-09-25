import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { TamaguiProvider } from '@tamagui/core'
import { config } from './tamagui.config'
import { Layout } from './components'
import { HomePage, DreamsPage, DreamDetailPage, NewDreamPage, EditDreamPage, AIInsightsPage } from './pages'

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
            <Route path="/insights" element={<AIInsightsPage />} />
          </Routes>
        </Layout>
      </Router>
    </TamaguiProvider>
  )
}

export default App
