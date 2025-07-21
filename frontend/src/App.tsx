import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import Signup from './components/Signup'
import Signin from './components/Signin'
import Dashboard from './components/Dashboard'
import Error from './components/Error'
import ViewBlog from './components/ViewBlog'
import EditBlog from './components/EditBlog'
import NewBlog from './components/NewBlog'

const Home = () => <Navigate to='/signup' replace/>

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/signup' element={<Signup />} />
        <Route path='/signin' element={<Signin />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/viewblog' element={<ViewBlog />} />
        <Route path='/editblog' element={<EditBlog />} />
        <Route path='/newblog' element={<NewBlog />} />
        <Route path='/error' element={<Error />} />
        <Route path='*' element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App