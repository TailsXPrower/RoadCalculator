import './App.css'
import Layout from './Layout'
import Calculations from './Calculations'
import Map from './Map'

function App() {

  return (
    <>
      <Layout>
        <div className='main-content'>
          <div className='calculations'>
            <Calculations />
          </div>
          <div className='map'>
            <Map />
          </div>
        </div>
      </Layout>
    </>
  )
}

export default App
