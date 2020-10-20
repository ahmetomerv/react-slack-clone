import React from 'react';
import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import Message from './Message';
import firebase from '../../firebase';
import { Segment, Comment } from 'semantic-ui-react';

class Messages extends React.Component {

    state = {
        messagesRef: firebase.database().ref('messages'),
        privateMessagesRef: firebase.database().ref('privateMessages'),
        channel: this.props.currentChannel,
        isPrivateChannel: this.props.isPrivateChannel,
        user: this.props.currentUser,
        messages: [],
        messagesLoading: false,
        progressBar: false,
        numUniqueUsers: '',
        searchTerm: '',
        searchLoading: false,
        searchResults: [],
    }

    componentDidMount() {
        const { channel, user } = this.state;

        if (channel && user) {
            this.addListeners(channel.id);
        }
    }

    handleSearchChange = (event) => {
        this.setState({
            searchTerm: event.target.value,
            searchLoading: true,
        }, () => this.handleSearchMessages());
    }

    handleSearchMessages = () => {
        const channelMessages = [...this.state.messages];
        const regex = new RegExp(this.state.searchTerm, 'gi');
        const searchResults = channelMessages.reduce((acc, message) => {
            if ((message.content && message.content.match(regex)) || message.user.name.match(regex)) {
                acc.push(message);
            }
            return acc;
        }, []);
        this.setState({ searchResults });
        setTimeout(() => this.setState({ searchLoading: false }), 1000);
    }

    addListeners = (channelId) => {
        this.addMessageListener(channelId);
    }

    addMessageListener = (channelId) => {
        let loadedMessages = [];
        const ref = this.getMessagesRef();

        ref.child(channelId).on('child_added', (snap) => {
            loadedMessages.push(snap.val());
            this.setState({
                messages: loadedMessages,
                messagesLoading: false,
            });
            this.countUniqueUsers(loadedMessages);
        });
    }

    getMessagesRef = () => {
        const { messagesRef, privateMessagesRef, isPrivateChannel } = this.state;
        return isPrivateChannel ? privateMessagesRef : messagesRef;
    }

    countUniqueUsers = (messages) => {
        const uniqueUsers = messages.reduce((acc, message) => {
            if (!acc.includes(message.user.name)) {
                acc.push(message.user.name);
            }
            return acc;
        }, []);
        const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
        const numUniqueUsers = `${uniqueUsers.length} user${plural ? 's' : ''}`;
        this.setState({ numUniqueUsers });
    }

    displayChannelName = (channel) => {
        return channel ? `${this.state.isPrivateChannel ? '@' : '#'}${channel.name}` : '';
    };

    displayMessages = (messages) => {
        return messages.length > 0 && messages.map(message => (
            <Message
                key={message.timestamp}
                message={message}
                user={this.state.user}
            />
        ));
    }

    isProgressBarVisible = (percent) => {
        if (percent > 0) {
            this.setState({ progressBar: true });
        }
    }

    render() {
        const {
            messagesRef,
            channel,
            user,
            messages,
            progressBar,
            numUniqueUsers,
            searchTerm,
            searchResults,
            searchLoading,
            isPrivateChannel,
        } = this.state;

        return (
            <React.Fragment>
                <MessagesHeader
                    handleSearchChange={this.handleSearchChange}
                    searchLoading={searchLoading}
                    numUniqueUsers={numUniqueUsers}
                    channelName={this.displayChannelName(channel)}
                    isPrivateChannel={isPrivateChannel}
                />

                <Segment>
                    <Comment.Group className={progressBar ? 'messages__progress' : 'messages'}>
                        { searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages) }
                    </Comment.Group>
                </Segment>

                <MessageForm
                    currentChannel={channel}
                    isProgressBarVisible={this.isProgressBarVisible}
                    currentUser={user}
                    messagesRef={messagesRef}
                    isPrivateChannel={isPrivateChannel}
                    getMessagesRef={this.getMessagesRef}
                />
            </React.Fragment>
        )
    }
}

export default Messages;