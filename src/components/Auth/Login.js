import React from 'react';
import { Link} from 'react-router-dom';
import firebase from '../../firebase';
import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react';

class Login extends React.Component {

    state = {
        email: '',
        password: '',
        errors: [],
        loading: false,
    }

    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    displayErrors = (errors) => errors.map((error, i) => <p key={i}>{ error.message }</p>);

    handleSubmit = (event) => {
        event.preventDefault();
        if (this.isFormValid(this.state)) {
            this.setState({ errors: [], loading: true });
            firebase
                .auth()
                .signInWithEmailAndPassword(this.state.email, this.state.password)
                .then(signedInUser => {
                    console.log(signedInUser);
                })
                .catch(err => {
                    this.setState({
                        errors: this.state.errors.concat(err),
                    })
                })
                .finally(() => {
                    this.setState({ loading: false });
                })
        }
    }

    isFormValid = ({ email, password }) => {
        return email && password;
    }

    handleInputError = (errors, inputName) => {
        if (inputName && errors.length) {
            return errors.some(err => err.message.toLowerCase().includes(inputName)) ? 'error' : '';
        }

        return '';
    }

    render() {
        const { email, password, errors, loading } = this.state;

        return(
            <Grid textAlign="center" verticalAlign="middle" className="app">
                <Grid.Column style={{ maxWidth: 450 }}>
                    <Header as="h2" color="violet" textAlign="center">
                        <Icon name="code branch" color="violet"/>
                        Login to DevChat
                    </Header>
                    <Form onSubmit={this.handleSubmit} size="large">
                        <Segment stacked>
                            <Form.Input fluid value={email} className={this.handleInputError(errors, 'email')} name="email" icon="mail" iconPosition="left" placeholder="Email Address" onChange={this.handleChange} type="email"/>
                            <Form.Input fluid value={password} className={this.handleInputError(errors, 'password')} name="password" icon="lock" iconPosition="left" placeholder="Password" onChange={this.handleChange} type="password"/>

                            <Button disabled={loading} className={loading ? 'loading' : ''} fluid color="violet" size="large">Submit</Button>
                        </Segment>
                    </Form>

                    {errors.length > 0 && (
                        <Message error>
                            <h3>Error</h3>
                            {this.displayErrors(errors)}
                        </Message>
                    )}

                    <Message>Don't have an account? <Link to="/register">Register </Link></Message>
                </Grid.Column>
            </Grid>
        )
    }
}

export default Login;