import React, { Component } from 'react';
import './Chat.css';
import fire from './../../fire';

var database = fire.database();

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
            <div>
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
            <div className='message' key={uid}>
                <div className='message-user'>{userName.charAt(0).toUpperCase()}</div>
                <div className='message-content'>{messageText}</div>
            </div>
        );
    }

    render(){
        return(
            <div>{this.props.messages.map((object) => this.renderMessage(object.userName, object.messageText, object.uid))}</div>
        );
    }
}

export default Chat;