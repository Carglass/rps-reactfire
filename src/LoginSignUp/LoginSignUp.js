import React, { Component } from 'react';
import './LoginSignUp.css';
import fire from './../fire';

class LoginSignUp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isNewUser: false,
        }
        this.handleNewUserState = this.handleNewUserState.bind(this);
    }

    handleNewUserState() {
        if (this.state.isNewUser === false) {
            this.setState({ isNewUser: true });
        } else {
            this.setState({ isNewUser: false });
        }
    }

    render() {
        if (this.state.isNewUser === false) {
            return (
                <Login toSignUp={this.handleNewUserState} />
            )
        } else {
            return (
                <SignUp />
            )
        }

    }
}

class Login extends Component {
    constructor(props){
        super(props);
        this.state = {
            email: '',
            password: '',
        }
        this.submitLogin = this.submitLogin.bind(this);
        this.handleEmail = this.handleEmail.bind(this);
        this.handlePassword = this.handlePassword.bind(this);
    }

    handleEmail(event){
        this.setState({email: event.target.value});
    }

    handlePassword(event){
        this.setState({password: event.target.value});
    }

    submitLogin(){
        fire.auth().signInWithEmailAndPassword(this.state.email, this.state.password).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // ...
          })
    }

    render(){
        return (
            <div>
                <label htmlFor="login-email">Email</label>
                <input type="email" id="login-email" value={this.state.email} onChange={this.handleEmail}/>
                <label htmlFor="login-password">Password</label>
                <input type="password" id="login-password" value={this.state.password} onChange={this.handlePassword}/>
                <button onClick={this.submitLogin}> Login</button>
                <button onClick={this.props.toSignUp}>Sign Up</button>
            </div>
        );
    }
}

function SignUp(props) {
    return (
        <div>Itworked</div>
    );
}

export default LoginSignUp;