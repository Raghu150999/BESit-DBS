import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { authorize } from './../../utils/authorize'
import { logInUser, logOutUser } from './../../actions/userActions';
import './styles.css';

class HomeNav extends Component {

  componentDidMount() {
    if (!this.props.userLoggedIn) {
      const token = localStorage.getItem('access_token');
      authorize(token).then(result => {
        if (result.success) {
          this.props.logInUser(result.user);
        }
        else {
          if (result.remove) {
            localStorage.removeItem('access_token');
          }
          this.props.history.push('/login');
        }
      });
    }
  }

  logOut = (e) => {
    e.preventDefault();
    localStorage.removeItem('access_token');
    this.props.logOutUser();
    this.props.history.push('/login');
  }

  calcTime(timestamp) {
    var x = new Date(timestamp);
    var y = new Date();
    var diff = (y.getTime() / 1000) - (x.getTime() / 1000);
    if (diff < 3600) {
      var val = parseInt(diff / 60);
      if (val != 1)
        return val + ' minutes ago';
      else
        return val + ' minute ago';
    }
    if (diff < 86400) {
      var val = parseInt(diff / 3600);
      if (val != 1)
        return val + ' hours ago';
      else
        return val + ' hour ago';
    }
    else {
      var val = parseInt(diff / 86400);
      if (val != 1)
        return val + ' days ago';
      else
        return val + ' day ago';
    }
  }

  render() {
    return (
      <nav className="navbar navbar-expand-sm bg-dark navbar-dark sticky-top">
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarToggler" aria-controls="navbarTogglerDemo03" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarToggler">
          <ul className="navbar-nav homenav">
            <li className="nav-item active">
              <Link to="/" className="nav-link">Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/buy" className="nav-link">Buy</Link>
            </li>
            <li className="nav-item">
              <Link to="/sell" className="nav-link">Sell</Link>
            </li>
            <li className="nav-item">
              <Link to="/requirements" className="nav-link">Requirements</Link>
            </li>
            <li className="nav-item">
              <Link to="/user" className="nav-link">User</Link>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="" onClick={this.logOut}>Logout</a> { /* @debug: Float this to right */}
            </li>
          </ul>
        </div>
      </nav>
    )
  }
}
const mapStateToProps = (state) => {
  return {
    userLoggedIn: state.userLoggedIn,
    user: state.user
  }
}


const mapDispatchToProps = (dispatch) => {
  return {
    logInUser: (user) => {
      dispatch(logInUser(user)); // calling a dispatch action
    },
    logOutUser: () => {
      dispatch(logOutUser());
    }
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(HomeNav));