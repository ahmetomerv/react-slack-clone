import React from 'react';
import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import Message from './Message';
import firebase from '../../firebase';
import { Segment, Comment } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { setUserPosts } from '../../actions';

class Messages extends React.Component {

    state = {
        messagesRef: firebase.database().ref('messages'),
        privateMessagesRef: firebase.database().ref('privateMessages'),
        channel: this.props.currentChannel,
        isPrivateChannel: this.props.isPrivateChannel,
        user: this.props.currentUser,
        usersRef: firebase.database().ref('users'),
        messages: [],
        messagesLoading: false,
        isChannelStarred: false,
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
            this.addUsersStarListener(channel.id, user.uid);
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

    handleStar = () => {
        this.setState(prevState => ({
            isChannelStarred: !prevState.isChannelStarred,
        }), () => {
            this.starChannel();
        });
    }

    starChannel = () => {
        if (this.state.isChannelStarred) {
            this.state.usersRef
                .child(`${this.state.user.uid}/starred`)
                .update({
                    [this.state.channel.id]: {
                        name: this.state.channel.name,
                        details: this.state.channel.details,
                        createdBy: {
                            name: this.state.channel.createdBy.name,
                            avatar: this.state.channel.createdBy.avatar,
                        }
                    }
                })
        } else {
            this.state.usersRef
                .child(`${this.state.user.uid}/starred`)
                .child(this.state.channel.id)
                .remove((err) => {
                    if (err !== null) {
                        console.log(err);
                    }
                });
        }
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
            this.countUserPosts(loadedMessages); 
        });
    }

    addUsersStarListener = (channelId, userId) => {
        this.state.usersRef
            .child(userId)
            .child('starred')
            .once('value')
            .then((data) => {
                if (data.val() !== null) {
                    const channelIds = Object.keys(data.val());
                    const prevStarred = channelIds.includes(channelId);
                    this.setState({ isChannelStarred: prevStarred });
                }
            })
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

    countUserPosts = (messages) => {
        let userPosts = messages.reduce((acc, message) => {
            if (message.user.name in acc) {
                acc[message.user.name].count += 1;
            } else {
                acc[message.user.name] = {
                    avatar: message.user.avatar,
                    count: 1,
                }
            }
            return acc;
        }, {});
        this.props.setUserPosts(userPosts);
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
            isChannelStarred,
        } = this.state;

        return (
            <React.Fragment>
                <MessagesHeader
                    handleSearchChange={this.handleSearchChange}
                    searchLoading={searchLoading}
                    numUniqueUsers={numUniqueUsers}
                    channelName={this.displayChannelName(channel)}
                    isPrivateChannel={isPrivateChannel}
                    isChannelStarred={isChannelStarred}
                    handleStar={this.handleStar}
                />

                <Segment loading={messages.length === 0}>
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

export default connect(null, { setUserPosts })(Messages);