import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import Spinner from './components/Spinner';
import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter as Router, Switch, Route, withRouter } from 'react-router-dom';
import firebase from './firebase';
import "semantic-ui-css/semantic.min.css";
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import rootReducer from './reducers';
import { setUser, clearUser } from './actions/index';

const store = createStore(rootReducer, composeWithDevTools());

class Root extends React.Component {

    componentDidMount() {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                this.props.setUser(user);
                this.props.history.push('/');
            } else {
                this.props.history.push('/login');
                this.props.clearUser();
            }
        })
    }

    render() {
        return this.props.isLoading ? <Spinner/> : (
            <Switch>
                <Route exact path="/" component={App}/>
                <Route path="/login" component={Login}/>
                <Route path="/register" component={Register}/>
            </Switch>
        )
    }
}

const mapStateFromProps = (state) => ({
    isLoading: state.user.isLoading,
});

const RootWithRoute = withRouter(connect(mapStateFromProps, { setUser, clearUser })(Root));
 
ReactDOM.render(
    <Provider store={store}>
        <Router>
            <RootWithRoute/>
        </Router>
    </Provider>,
    document.getElementById('root'));
registerServiceWorker();
