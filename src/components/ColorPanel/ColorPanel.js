import React from 'react';
import { Sidebar, Button, Menu, Divider, Modal, Icon, Label, Segment } from 'semantic-ui-react';
import { SliderPicker } from 'react-color';
import firebase from '../../firebase';
import { connect } from 'react-redux';
import { setColors } from '../../actions';

class ColorPanel extends React.Component {

    state = {
        modal: false,
        primary: '',
        secondary: '',
        userColors: [], 
        usersRef: firebase.database().ref('users'),
        user: this.props.currentUser, 
    }

    componentDidMount() {
        if (this.state.user) {
            this.addListener(this.state.user.uid);
        }
    }

    addListener = (userId) => {
        let userColors = [];
        
        this.state.usersRef
            .child(`${this.state.user.uid}/colors`)
            .on('child_added', (snap) => {
                userColors.unshift(snap.val());
                this.setState({ userColors });
            });
    }

    openModal = () => {
        this.setState({ modal: true });
    }

    closeModal = () => {
        this.setState({ modal: false });
    }

    handleChangePrimary = (color) => {
        this.setState({ primary: color.hex });
    }

    handleChangeSecondary = (color) => {
        this.setState({ secondary: color.hex });
    }

    handleSaveColors = () => {
        const { primary, secondary } = this.state;

        if (primary && secondary) {
            this.saveColors(primary, secondary);
        }
    }

    saveColors = (primary, secondary) => {
        this.state.usersRef
            .child(`${this.state.user.uid}/colors`)
            .push()
            .update({
                primary,
                secondary,
            })
            .then(() => {
                console.log('Colors saved');
            })
            .catch((err) => console.error(err))
            .finally(() => this.closeModal());
    }

    displayUserColors = (colors) => (
        colors.length > 0 && colors.map((color, i) => (
            <React.Fragment key={i}>
                <Divider/>
                <div className="color__container" onClick={() => this.props.setColors(color.primary, color.secondary)}>
                    <div className="color__square" style={{ background: color.primary }}>
                        <div className="color__overlay"style={{ background: color.secondary }}></div>
                    </div>
                </div>
            </React.Fragment>
        ))
    )

    render() {
        const { modal, primary, secondary, userColors } = this.state;

        return (
            <Sidebar
                as={Menu}
                icon="labeled"
                width="very thin"
                inverted vertical visible
            >
                <Divider />
                <Button icon="add" color="blue" size="small" onClick={this.openModal} />

                {this.displayUserColors(userColors)}

                <Modal basic open={modal}>
                    <Modal.Header>Choose App Colors</Modal.Header>
                    <Modal.Content>
                        <Segment inverted>
                            <Label content="Primary Color" />
                            <SliderPicker color={primary} onChange={this.handleChangePrimary} />
                        </Segment>
                        <Segment inverted>
                            <Label content="Secondary Color" />
                            <SliderPicker color={secondary} onChange={this.handleChangeSecondary} />
                        </Segment>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button inverted color="green" onClick={this.handleSaveColors} >
                            <Icon name="checkmark" /> Save Colors
                        </Button>
                        <Button inverted color="red" onClick={this.closeModal}>
                            <Icon name="remove" /> Cancel
                        </Button>
                    </Modal.Actions>
                </Modal>

            </Sidebar>
        )
    }
}

export default connect(null, { setColors })(ColorPanel);