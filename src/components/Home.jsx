import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Home() {

  const navigateTo = useNavigate()

  useEffect(() => {
    if(localStorage.getItem('authToken')) {
      navigateTo('/dashboard/play')
    }else {
      navigateTo('/login')
    }
  }, [])
    return (
      <>
      </>
    )
  }
  
  export default Home