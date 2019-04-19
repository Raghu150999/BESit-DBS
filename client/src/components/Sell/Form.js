import React, { Component } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

class Form extends Component {
  state = {
    files: null,
    imageAvailable: false,
    err: false
  }

  submitForm = (e) => {
    e.preventDefault();

    if (this.state.err) {
      return;
    }

    // use this type of object passing if endpoint uses bodyparser
    const formData = {
      category: e.target[0].value,
      category_name: e.target[0].value,
      name: e.target[1].value,
      price: e.target[2].value,
      desc: e.target[3].value,
      rating: e.target[4].value,
      timestamp: Date(),
      owner: this.props.user.username,
      status: 'Available'
    };

    axios.post('/uploaditem', formData)
      .then(res => {
        //reload the page after uploading image successfully
        window.location = '/sell';
      });
  }

  render() {
    let categories = this.props.categories.map(category => {
      return (
        <option key={category.name}>{category.name}</option>
      )
    });
    return (
      <div>
        <form onSubmit={this.submitForm}>
          <div className="form-group">
            <label htmlFor="exampleFormControlSelect1">Category</label>
            <select className="form-control" id="exampleFormControlSelect1">
              {categories}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="exampleFormControlInput1">Name Of Item</label>
            <input type="text" className="form-control" id="exampleFormControlInput1" placeholder="eg:Harry Potter Books"></input>
          </div>
          <div className="form-group">
            <label htmlFor="exampleFormControlInput1">Expected Price(Approx)</label>
            <input type="text" className="form-control" id="exampleFormControlInput1"></input>
          </div>
          <div className="form-group">
            <label htmlFor="exampleFormControlTextarea1">Short Description</label>
            <textarea className="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="exampleFormControlSelect1">Condition</label>
            <select className="form-control" id="exampleFormControlSelect1">
              <option>1 star</option>
              <option>2 stars</option>
              <option>3 stars</option>
              <option>4 stars</option>
              <option>5 stars</option>
            </select>
          </div>
          <button> Submit </button>
        </form>
        <br />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    userLoggedIn: state.userLoggedIn,
    user: state.user
  }
}

export default connect(mapStateToProps)(withRouter(Form));