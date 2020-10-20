import React from 'react';
import { Link} from 'react-router-dom';
import firebase from '../../firebase';
import md5 from 'md5';
import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react';

class Register extends React.Component {

    state = {
        username: '',
        email: '',
        password: '',
        passwordConfirmation: '',
        errors: [],
        loading: false,
        usersRef: firebase.database().ref('users'),
    }

    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    isFormValid = () => {
        let errors = [];
        let error;

        if (this.isFormEmpty(this.state)) {
            error = { message: 'Fill in the fields.' };
            this.setState({ errors: errors.concat(error) });
            return false;
        } else if (!this.isPasswordValid(this.state)) {
            error = { message: 'Password is invalid.' };
            this.setState({ errors: errors.concat(error) });
            return false;
        } else {
            return true;
        }
    }

    isPasswordValid = ({ password, passwordConfirmation }) => {
        return password.length < 6 || passwordConfirmation.length < 6 || password !== passwordConfirmation ? false : true;
    }

    isFormEmpty = ({ username, email, password, passwordConfirmation }) => {
        return !username.length || !email.length || !password.length || !passwordConfirmation.length;
    }

    displayErrors = (errors) => errors.map((error, i) => <p key={i}>{ error.message }</p>);

    handleSubmit = (event) => {
        event.preventDefault();
        if (this.isFormValid()) {
            this.setState({ errors: [], loading: true });
            firebase
                .auth()
                .createUserWithEmailAndPassword(this.state.email, this.state.password)
                .then(createdUser => {
                    console.log(createdUser);
                    createdUser.user.updateProfile({
                        displayName: this.state.username,
                        photoURL: `https://gravatar.com/avatar/${md5(createdUser.user.email)}?d=identicon`,
                    })
                    .then(() => {
                        this.saveUser(createdUser).then(() => {
                            console.log('User saved.');
                        })
                    })
                    .catch((err) => {
                        this.setState({ errors: this.state.errors.concat(err) });
                    })
                    .finally(() => {
                        this.setState({ loading: false });
                    });
                })
                .catch(err => {
                    console.log(err);
                    this.setState({ errors: this.state.errors.concat(err) });
                })
                .finally(() => {
                    this.setState({ loading: false });
                });
        }
    }

    saveUser = (createdUser) => {
        return this.state.usersRef.child(createdUser.user.uid).set({
            name: createdUser.user.displayName,
            avatar: createdUser.user.photoURL,
        });
    }

    handleInputError = (errors, inputName) => {
        if (inputName && errors.length) {
            return errors.some(err => err.message.toLowerCase().includes(inputName)) ? 'error' : '';
        }

        return '';
    }

    render() {
        const { username, email, password, passwordConfirmation, errors, loading } = this.state;

        return(
            <Grid textAlign="center" verticalAlign="middle" className="app">
                <Grid.Column style={{ maxWidth: 450 }}>
                    <Header as="h2" color="orange" textAlign="center">
                        <Icon name="puzzle piece" color="orange"/>
                        Register for DevChat
                    </Header>
                    <Form onSubmit={this.handleSubmit} size="large">
                        <Segment stacked>
                            <Form.Input fluid value={username} name="username" icon="user" iconPosition="left" placeholder="Username" onChange={this.handleChange} type="text"/>
                            <Form.Input fluid value={email} className={this.handleInputError(errors, 'email')} name="email" icon="mail" iconPosition="left" placeholder="Email Address" onChange={this.handleChange} type="email"/>
                            <Form.Input fluid value={password} className={this.handleInputError(errors, 'password')} name="password" icon="lock" iconPosition="left" placeholder="Password" onChange={this.handleChange} type="password"/>
                            <Form.Input fluid value={passwordConfirmation} className={this.handleInputError(errors, 'password')} name="passwordConfirmation" icon="repeat" iconPosition="left" placeholder="Password Confirmation" onChange={this.handleChange} type="password"/>

                            <Button disabled={loading} className={loading ? 'loading' : ''} fluid color="orange" size="large">Submit</Button>
                        </Segment>
                    </Form>

                    {errors.length > 0 && (
                        <Message error>
                            <h3>Error</h3>
                            {this.displayErrors(errors)}
                        </Message>
                    )}

                    <Message>Already a user? <Link to="/login">Login</Link></Message>
                </Grid.Column>
            </Grid>
        )
    }
}

export default Register;