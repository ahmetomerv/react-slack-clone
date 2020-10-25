import React from 'react';
import './App.css';
import { connect } from 'react-redux';
import { Grid } from 'semantic-ui-react';
import ColorPanel from './ColorPanel/ColorPanel';
import SidePanel from './SidePanel/SidePanel';
import Messages from './Messages/Messages';
import MetaPanel from './MetaPanel/MetaPanel';

const App = ({ currentUser, currentChannel, isPrivateChannel, userPosts, primaryColor, secondaryColor }) => (
    <Grid columns="equal" className="app" style={{ background: secondaryColor }}>
        <ColorPanel key={currentUser && currentUser.name} currentUser={currentUser} />
        <SidePanel key={currentUser && currentUser.id} currentUser={currentUser} primaryColor={primaryColor} />

        <Grid.Column style={{ marginLeft: 320 }}>
            <Messages
                key={currentChannel && currentChannel.id}
                currentUser={currentUser}
                currentChannel={currentChannel}
                isPrivateChannel={isPrivateChannel}
            />
        </Grid.Column>

        <Grid.Column width={4}>
            <MetaPanel
                key={currentChannel && currentChannel.name}
                isPrivateChannel={isPrivateChannel}
                currentChannel={currentChannel}
                userPosts={userPosts}
            />
        </Grid.Column>

    </Grid>
);

const mapStateToProps = (state) => ({
    currentUser: state.user.currentUser,
    currentChannel: state.channel.currentChannel,
    isPrivateChannel: state.channel.isPrivateChannel,
    userPosts: state.channel.userPosts,
    primaryColor: state.colors.primaryColor,
    secondaryColor: state.colors.secondaryColor,
});

export default connect(mapStateToProps)(App);
