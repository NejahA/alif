import './App.css';
import { Link,Routes,Route } from 'react-router-dom';
import Home from "./Components/Home"
import ShowOne from "./Components/ShowOne"
import Edit from './Components/Edit'
import 'bootstrap/dist/css/bootstrap.min.css'

function App() {

  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Home /> } />
        <Route path='/thing/:id' element={<ShowOne />} />
        <Route path='/thing/edit/:id' element={<Edit />} />
      </Routes>
    </div>
  );
}

export default App;
