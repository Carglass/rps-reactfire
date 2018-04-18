import React, { Component } from 'react';
import './App.css';
import fire from './fire';

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

///////////////////////////
// Login & Sign up Mngmt //
///////////////////////////

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

class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            keepalive: true,
        }
        this.submitLogout = this.submitLogout.bind(this);
    }

    submitLogout(){
        fire.auth().signOut();
    }

    render() {
        return (
            <div>
                <div>{this.props.user.name} is connected</div>
                <button onClick={this.submitLogout}>Logout</button>
                <Chat user={this.props.user}/>
                <Game user={this.props.user}/>
            </div>
        );
    }
}

////////////////
// Game Mngmt //
////////////////

var GAME_STATE = {
    MATCHMAKING: 1,
    WAITING_JOINER: 2,
    GAME_START: 3,
    WAITING_OPPONENT: 4,
    GAME_RESULTS: 5,
}

var SESSION_STATE = {
    OPEN: 1,
    CLOSED: 2,
    REALIZED: 3,
}

class Game extends Component{
    constructor(props){
        super(props);
        this.state = {
            gameState: GAME_STATE.MATCHMAKING,
            gameOpponent: '',
            gamePlayer: '',
            sessionUid: '',
        }
        this.closedSessionsListeningAction = this.closedSessionsListeningAction.bind(this);
        this.listenToClosedSessions = this.listenToClosedSessions.bind(this);
        this.listenToClosedSessions();
    }

    closedSessionsListeningAction(snapshot){
        if (this.props.user.uid === snapshot.val().creator.uid){
            let player = snapshot.val().creator;
            let opponent = snapshot.val().joiner;
            let toBeSessionUid = snapshot.key;
            this.setState({
                gameState: GAME_STATE.GAME_START,
                gameOpponent: opponent,
                gamePlayer: player,
                sessionUid: toBeSessionUid,
            })
        } else if (this.props.user.uid === snapshot.val().joiner.uid){
            let player = snapshot.val().joiner;
            let opponent = snapshot.val().creator;
            let toBeSessionUid = snapshot.key;
            this.setState({
                gameState: GAME_STATE.GAME_START,
                gameOpponent: opponent,
                gamePlayer: player,
                sessionUid: toBeSessionUid,
            })
        }
    }

    listenToClosedSessions(){
        database.ref('sessions').orderByChild('state').equalTo(SESSION_STATE.CLOSED).on('child_added', this.closedSessionsListeningAction);
    }

    render(){
        if (this.state.gameState === 1){
            return(
                <Matchmaking user={this.props.user}/>
            );
        } else if (this.state.gameState === 2){
            return(
                <div>WAITING JOINER

                </div>
            );
        } else if (this.state.gameState === 3){
            return(
                <div>GAME START

                </div>
            ); 
        } else if (this.state.gameState === 4){
            return(
                <div>WAITING OPPONENT 

                </div>
            );  
        } else if (this.state.gameState === 5){
            return(
                <div>GAME RESULTS

                </div>
            ); 
        }
    }
}



class Matchmaking extends Component{
    constructor(props){
        super(props);
        this.state = {
            sessions: [],
        }
        this.handleNewSessionSubmit = this.handleNewSessionSubmit.bind(this);
        this.listenToNewSessions = this.listenToNewSessions.bind(this);
        this.newSessionsListeningAction = this.newSessionsListeningAction.bind(this);
        this.listenToRemovedSessions = this.listenToRemovedSessions.bind(this);
        this.removedSessionsListeningAction = this.removedSessionsListeningAction.bind(this);
        this.handleJoinSession = this.handleJoinSession.bind(this);
        this.listenToNewSessions();
        this.listenToRemovedSessions();
    }

    handleJoinSession(uid){
        database.ref('sessions/' + uid).update({
            'joiner': {
                'displayName': this.props.user.name,
                'uid': this.props.user.uid,
                'choice': '',
            },
            'state': SESSION_STATE.CLOSED,
        })
    }

    handleNewSessionSubmit(){
        let session = {
            'creator': {
                'displayName': this.props.user.name,
                'uid': this.props.user.uid,
                'choice': '',
            },
            state: SESSION_STATE.OPEN,
        }
        database.ref('sessions').push(session);
    }

    newSessionsListeningAction(snapshot){
        if (snapshot.val().creator.uid !== this.props.user.uid){
            let sessionsCopy = this.state.sessions.slice();
            let addedSession = {
            uid: snapshot.key,
            creator: snapshot.val().creator,
            state: snapshot.val().state,
            }
            sessionsCopy.push(addedSession);
            this.setState({sessions: sessionsCopy});
        }
    }

    listenToNewSessions(){
        database.ref('sessions').orderByChild('state').equalTo(SESSION_STATE.OPEN).on('child_added', this.newSessionsListeningAction);
    }

    //TODO: Remember to unmount this component when in game -> will kill listeners? 

    removedSessionsListeningAction(snapshot){
        let sessionsCopy = this.state.sessions.slice();
        for (let sessionIndex in sessionsCopy){
            if (sessionsCopy[sessionIndex].uid === snapshot.key){
                sessionsCopy.splice(sessionIndex,1);
            }
        }
        this.setState({sessions: sessionsCopy});
    }

    listenToRemovedSessions(){
        database.ref('sessions').orderByChild('state').equalTo(SESSION_STATE.OPEN).on('child_removed', this.removedSessionsListeningAction);
    }

    render(){
        return(
            <div>
                <Sessions sessions={this.state.sessions} joinSession={this.handleJoinSession}/>
                <button onClick={this.handleNewSessionSubmit}>Create Session</button>
            </div>
        );
    }
}

function Session(props){
    return(
        <div key={props.session.uid}>
            <div>{props.session.creator.displayName}'s Game</div>
            <button onClick={()=>props.joinSession(props.session.uid)}>Join Session</button>
        </div>
    )
}

function Sessions(props){
    return(
        <div>
            {props.sessions.map((sessionData)=>Session({session: sessionData, joinSession: props.joinSession}))}
        </div>
    );
}

////////////////
// Chat Mngmt //
////////////////

class Chat extends Component{
    constructor(props){
        super(props);
        this.state = {
            messages: [],
            newMessage: '',
        }
        this.handleNewMessageSubmitKeyboard = this.handleNewMessageSubmitKeyboard.bind(this);
        this.handleNewMessageEdit = this.handleNewMessageEdit.bind(this);
        this.listenToNewMessages = this.listenToNewMessages.bind(this);
        this.messagesListeningAction = this.messagesListeningAction.bind(this);
        this.listenToDeletedMessages = this.listenToDeletedMessages.bind(this);
        this.messagesDeletionListeningAction = this.messagesDeletionListeningAction.bind(this);
        this.listenToNewMessages();
        this.listenToDeletedMessages();
    }

    handleNewMessageSubmitKeyboard(event){
        if (event.keyCode === 13){
            database.ref('chat/messages').push({
                userDisplayName: this.props.user.name,
                userId: this.props.user.uid,
                message: this.state.newMessage,
            });
            this.setState({newMessage: ''})
        }
    }

    handleNewMessageEdit(event){
        this.setState({newMessage: event.target.value});
    }

    messagesListeningAction(snapshot){
        let message = {
            uid: snapshot.key,
            userName: snapshot.val().userDisplayName,
            messageText: snapshot.val().message,
        }

        let messagesCopy = this.state.messages.slice();
        messagesCopy.push(message);
        this.setState({messages: messagesCopy});
    }

    listenToNewMessages(){
        database.ref('chat/messages').limitToLast(10).on('child_added', this.messagesListeningAction);
    }

    messagesDeletionListeningAction(snapshot){
        let uidToFind = snapshot.key;
        let messagesCopy = this.state.messages;
        for (let i = 0; i < messagesCopy.length; i++){
            if (messagesCopy[i].uid === uidToFind){
                messagesCopy.splice(i,1);
            }
        }
        this.setState({messages: messagesCopy});
    }

    listenToDeletedMessages(){
        database.ref('chat/messages').limitToLast(10).on('child_removed', this.messagesDeletionListeningAction);
    }

    render(){
        return (
            <div>Chat
                <Messages messages={this.state.messages}/>
                <label htmlFor="chat-new-message">Your message</label>
                <input type="text" id="chat-new-message" value={this.state.newMessage} onChange={this.handleNewMessageEdit} onKeyDown={this.handleNewMessageSubmitKeyboard}/>
            </div>
        )
    }
}

class Messages extends Component{
    constructor(props){
        super(props);
    }
    //TODO: Convert into functional component

    renderMessage(userName,messageText,uid){
        return(
            <div key={uid}>
                <div>{userName}</div>
                <div>{messageText}</div>
            </div>
        );
    }

    render(){
        return(
            <div>{this.props.messages.map((object) => this.renderMessage(object.userName, object.messageText, object.uid))}</div>
        );
    }
}

export default App;
