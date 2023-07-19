import { useNavigate } from 'react-router-dom'


export function MainScreen() {
  const navigate = useNavigate()

  return (
    <main>
      <button onClick={() => navigate('/search')}>Go to Search screen</button>

    
    </main>
  )
}