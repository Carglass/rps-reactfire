import React, { Component } from 'react';
import './App.css';

class App extends Component {
    constructor(props){
        super(props);
        this.state = {
            isLogged: false,
        }
        this.handleLogin = this.handleLogin.bind(this);
    }

  handleLogin(){
    if (this.state.isLogged === false){
      this.setState({isLogged: true});
    }
  }
  
  render() {
    if (this.state.isLogged === true){
      return (
        <Main />
      );
    } else if (this.state.isLogged === false){
      return (
        <LoginSignUp />
      )
    }
  }
}

class LoginSignUp extends Component {
  constructor(props){
    super(props);
    this.state = {
      isNewUser: false,
    }
    this.handleNewUserState = this.handleNewUserState.bind(this);
  }

  handleNewUserState(){
    if (this.state.isNewUser === false){
      this.setState({isNewUser: true});
    } else {
      this.setState({isNewUser: false});
    }
  }

  render(){
    if (this.state.isNewUser === false){
      return(
        <Login toSignUp={this.handleNewUserState}/>
      )
    } else {
      return(
        <SignUp />
      )
    }
    
  }
}

function Login(props){
  return (
    <button onClick={props.toSignUp}/>
  );
}

function SignUp(props){
  return(
    <div>Itworked</div>
  );
}

class Main extends Component {
  constructor(props){
    super(props);
    this.state = {
      keepalive: true,
    }
  }

  render(){
    return (
      <div>Main App</div>
    ); 
  }
}

export default App;
