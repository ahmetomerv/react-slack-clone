import React from 'react';
import { Segment, Button, Input } from 'semantic-ui-react';
import firebase from '../../firebase';
import FileModal from './FileModal';
import ProgressBar from './ProgressBar';
import uuidv4 from 'uuid/v4';

class MessageForm extends React.Component {

    state = {
        storageRef: firebase.storage().ref(),
        uploadTask: null,
        uploadState: '',
        message: '',
        percentUploaded: 0,
        loading: false,
        channel: this.props.currentChannel,
        user: this.props.currentUser,
        errors: [],
        modal: false,
        isPrivateChannel: this.props.isPrivateChannel,
    }

    openModal = () => {
        this.setState({ modal: true });
    }

    closeModal = () => {
        this.setState({ modal: false });
    }

    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value,
        });
    }

    createMessage = (fileUrl = null) => {
        const { message, user } = this.state;
        const newMessage = {
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: {
                id: user.uid,
                name: user.displayName,
                avatar: user.photoURL,
            }
        }

        if (fileUrl !== null) {
            newMessage['image'] = fileUrl;
        } else {
            newMessage['content'] = this.state.message;
        }

        return newMessage;
    }

    sendMessage = () => {
        const { getMessagesRef } = this.props;
        const { message, channel } = this.state;

        if (message) {
            this.setState({ loading: true });

            getMessagesRef()
                .child(channel.id)
                .push()
                .set(this.createMessage())
                .then(() => {
                    this.setState({ message: '', errors: [] });
                })
                .catch((err) => {
                    console.error(err);
                    this.setState({ errors: this.state.errors.concat(err) });
                })
                .finally(() => {
                    this.setState({ loading: false });
                })
        } else {
            this.setState({
                errors: this.state.errors.concat({
                    message: 'Add a message',
                })
            })
        }
    }

    getPath = () => {
        if (this.props.isPrivateChannel) {
            return `chat/private-${this.state.channel.id}`;
        } else {
            return 'chat/public';
        }
    }

    uploadFile = (file, metadata) => {
        const pathToUpload = this.state.channel.id;
        const ref = this.props.getMessagesRef();
        const filePath = `${this.getPath()}/${uuidv4()}.jpg`;

        this.setState({
            uploadState: 'uploading',
            uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
        }, () => {
            this.state.uploadTask.on('state_changed', (snap) => {
                const percentUploaded = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
                this.props.isProgressBarVisible(percentUploaded);
                this.setState({ percentUploaded });
            }, (error) => {
                console.error(error);
                this.setState({
                    errors: this.state.errors.concat(error),
                    uploadState: 'error',
                    uploadTask: null,
                });
            }, () => {
                this.state.uploadTask.snapshot.ref.getDownloadURL()
                    .then(downloadUrl => {
                        this.sendFileMessage(downloadUrl, ref, pathToUpload);
                    })
                    .catch(error => {
                        console.error(error);
                        this.setState({
                            errors: this.state.errors.concat(error),
                            uploadState: 'error',
                            uploadTask: null,
                        });
                    });
            })
        });
    }

    sendFileMessage(fileUrl, ref, pathToUpload) {
        ref.child(pathToUpload)
            .push()
            .set(this.createMessage(fileUrl))
            .then(() => {
                this.setState({ uploadState: 'done' });
            })
            .catch((error) => {
                console.error(error);
                this.setState({
                    errors: this.state.errors.concat(error),
                });
            });
    }

    render() {
        const { errors, message, loading, modal, uploadState, percentUploaded } = this.state;

        return (
            <Segment className="message__form">
                <Input
                    fluid
                    name="message"
                    onChange={this.handleChange}
                    value={message}
                    labelPosition="left"
                    placeholder="Write your message"
                    style={{ marginBottom: '0.7em' }}
                    label={<Button icon="add" />}
                    className={
                        errors.some((error) => error.message.includes('message')) ? 'error' : ''
                    }
                />

                <Button.Group icon widths="2">
                    <Button onClick={this.sendMessage} disabled={loading} color="orange" content="Add Reply" labelPosition="left" icon="edit"/>
                    <Button onClick={this.openModal} disabled={uploadState === 'uploading'} color="teal" content="Upload Media" labelPosition="right" icon="cloud upload"/>
                </Button.Group>
                <FileModal modal={modal} uploadFile={this.uploadFile} closeModal={this.closeModal} />
                <ProgressBar uploadState={uploadState} percentUploaded={percentUploaded} />

            </Segment>
        )
    }
}

export default MessageForm;