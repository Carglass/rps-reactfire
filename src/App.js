import React, { Component } from 'react';
import './App.css';
import fire from './fire';
import LoginSignUp from './LoginSignUp/LoginSignUp';
import Main from './Main/Main';
import { Map, List, fromJS } from 'immutable';

var database = fire.database();

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLogged: false,
        }
        this.handleLogin = this.handleLogin.bind(this);
        this.loginListeningAction = this.loginListeningAction.bind(this);
        this.handleLogin();
    }

    loginListeningAction(loggedUser){
        if (loggedUser) {
            this.setState({
                isLogged: true, 
                user:{
                    name: loggedUser.displayName,
                    uid: loggedUser.uid,
                    // TODO: find how to put the wins in user directly, rather than in the database, where it is not so safe? or is it once we put the appropriate rules? 
                    // Basically, if I can read it myself, not a good sign.
                }
            });
        } else {
            this.setState({isLogged: false});
            //TODO: Somehow, it needs to reinitialize the app :/ not easy, considering you need to access all the states? 
        }
    }

    handleLogin() {
        fire.auth().onAuthStateChanged(this.loginListeningAction);
    }

    render() {
        if (this.state.isLogged === true) {
            return (
                <Main user={this.state.user}/>
            );
        } else if (this.state.isLogged === false) {
            return (
                <LoginSignUp />
            )
        }
    }
}



////////////////
// Chat Mngmt //
////////////////



export default App;
