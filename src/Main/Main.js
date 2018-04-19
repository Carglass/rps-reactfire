import React, { Component } from 'react';
import './Main.css';
import fire from './../fire';
import Chat from './Chat/Chat';
import { Map, List, fromJS } from 'immutable';

var database = fire.database();

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
            <div className='main-wrapper'>
                <div className='left-panel'>
                    <div>{this.props.user.name} is connected</div>
                    <button onClick={this.submitLogout}>Logout</button>
                    <Chat user={this.props.user}/>
                </div>
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
        this.opponentPromiseResolver = this.opponentPromiseResolver.bind(this);
        this.opponentPromiseThenAction = this.opponentPromiseThenAction.bind(this);
        this.playerPromiseResolver = this.playerPromiseResolver.bind(this);
        this.playerPromiseThenAction = this.playerPromiseThenAction.bind(this);
        this.listenToChoices = this.listenToChoices.bind(this);
        this.handleChoice = this.handleChoice.bind(this);
        this.closedSessionsListeningAction = this.closedSessionsListeningAction.bind(this);
        this.listenToClosedSessions = this.listenToClosedSessions.bind(this);
        this.listenToClosedSessions();
    }

    opponentPromiseResolver(resolve,reject){
        if (this.state.gamePlayer.role === 'creator'){
            database.ref('sessions/' + this.state.sessionUid + '/joiner/choice').on('value',function(snapshot){
                if (snapshot.val() !== ''){
                    console.log(snapshot.val());
                    resolve(snapshot.val());
                }
            });
        } else if (this.state.gamePlayer.role === 'joiner'){
            database.ref('sessions/' + this.state.sessionUid + '/creator/choice').on('value',function(snapshot){
                if (snapshot.val() !== ''){
                    console.log(snapshot.val());
                    resolve(snapshot.val());
                }
            })
        }
    }

    opponentPromiseThenAction(value){
        const opponentMap = fromJS(this.state.gameOpponent);
        this.setState({gameOpponent: opponentMap.set('choice',value).toJS()});
        console.log(this.state.gameOpponent);
    }

    playerPromiseResolver(resolve,reject){
        if (this.state.gamePlayer.role === 'creator'){
            database.ref('sessions/' + this.state.sessionUid + '/creator/choice').on('value',function(snapshot){
                if (snapshot.val() !== ''){
                    console.log(snapshot.val());
                    resolve(snapshot.val());
                }
            });
        } else if (this.state.gamePlayer.role === 'joiner'){
            database.ref('sessions/' + this.state.sessionUid + '/joiner/choice').on('value',function(snapshot){
                if (snapshot.val() !== ''){
                    console.log(snapshot.val());
                    resolve(snapshot.val());
                }
            });
        }
    }

    playerPromiseThenAction(value){
        const playerMap = fromJS(this.state.gamePlayer);
        this.setState({gamePlayer: playerMap.set('choice',value).toJS()});
        console.log(this.state.gamePlayer);
    }

    listenToChoices(){
        var opponentChoice = new Promise(this.opponentPromiseResolver);
        opponentChoice.then(this.opponentPromiseThenAction);
        var playerChoice = new Promise(this.playerPromiseResolver);
        playerChoice.then(this.playerPromiseThenAction);
    }

    handleChoice(choice){
        if (this.state.gamePlayer.role === 'creator'){
            database.ref('sessions/' + this.state.sessionUid).update({'creator/choice':choice});
        } else if (this.state.gamePlayer.role === 'joiner'){
            database.ref('sessions/' + this.state.sessionUid).update({'joiner/choice':choice});
        }  
    }

    //TODO: will need to add the handler to answer the promise when creating a session and going to Waiting for other player 
    // or maybe better on database.ref('sessions').orderByChild('state').equalTo(SESSION_STATE.OPEN).orderByChild('creator/uid').equalTo(this.props.user.uid).on('child_added',()=>faire la session)

    closedSessionsListeningAction(snapshot){
        if (this.props.user.uid === snapshot.val().creator.uid){
            let player = {
                choice: snapshot.val().creator.choice,
                displayName: snapshot.val().creator.displayName,
                uid: snapshot.val().creator.uid,
                role: 'creator',
            };
            let opponent = {
                choice: snapshot.val().joiner.choice,
                displayName: snapshot.val().joiner.displayName,
                uid: snapshot.val().joiner.uid,
                role: 'joiner',
            };
            let toBeSessionUid = snapshot.key;
            this.setState({
                gameState: GAME_STATE.GAME_START,
                gameOpponent: opponent,
                gamePlayer: player,
                sessionUid: toBeSessionUid,
            })
        } else if (this.props.user.uid === snapshot.val().joiner.uid){
            let opponent = {
                choice: snapshot.val().creator.choice,
                displayName: snapshot.val().creator.displayName,
                uid: snapshot.val().creator.uid,
                role: 'creator',
            };
            let player = {
                choice: snapshot.val().joiner.choice,
                displayName: snapshot.val().joiner.displayName,
                uid: snapshot.val().joiner.uid,
                role: 'joiner',
            };
            let toBeSessionUid = snapshot.key;
            this.setState({
                gameState: GAME_STATE.GAME_START,
                gameOpponent: opponent,
                gamePlayer: player,
                sessionUid: toBeSessionUid,
            })
        }
        this.listenToChoices();
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
                <div>
                    <div id='rock' onClick={()=>this.handleChoice('rock')}>Rock</div>
                    <div id='paper' onClick={()=>this.handleChoice('paper')}>Paper</div>
                    <div id='scissors' onClick={()=>this.handleChoice('scissors')}>Scissors</div>
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

///////////////////////////////
///////////////////////////////



export default Main;