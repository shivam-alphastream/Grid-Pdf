import logo from "./logo.svg";
import "./App.css";
import NavBar from "./components/NavBar";
import Grid from "./components/Grid";
import React, { Component }  from 'react';

function App() {
  return (
    <div className="App">
      <NavBar></NavBar>
      <div>
      <Grid></Grid>  
      </div>
      
    </div>
  );
}

export default App;
