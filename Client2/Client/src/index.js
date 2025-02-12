import React from 'react';
import ReactDOM from 'react-dom'; // Sử dụng react-dom thay vì react-dom/client
import reportWebVitals from './reportWebVitals'; // Sửa 'form' thành 'from'
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { BrowserRouter } from "react-router-dom";

ReactDOM.render(
  <React.StrictMode>
     <BrowserRouter>

     <App />
     
     </BrowserRouter>

  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
