// es5, 6, and 7 polyfills, powered by babel
import polyfill from "babel-polyfill"

//
// fetch method, returns es6 promises
// if you uncomment 'universal-utils' below, you can comment out this line
import fetch from "isomorphic-fetch"

// universal utils: cache, fetch, store, resource, fetcher, router, vdom, etc
// import * as u from 'universal-utils'

// the following line, if uncommented, will enable browserify to push
// a changed fn to you, with source maps (reverse map from compiled
// code line # to source code line #), in realtime via websockets
// -- browserify-hmr having install issues right now
// if (module.hot) {
//     module.hot.accept()
//     module.hot.dispose(() => {
//         app()
//     })
// }

// Check for ServiceWorker support before trying to install it
// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('./serviceworker.js').then(() => {
//         // Registration was successful
//         console.info('registration success')
//     }).catch(() => {
//         console.error('registration failed')
//             // Registration failed
//     })
// } else {
//     // No ServiceWorker Support
// }

import DOM from 'react-dom'
import React, {Component} from 'react'

import Firebase from 'firebase'
var fbRef = new Firebase("https://bigtimesecrets.firebaseio.com/")

import $ from 'jquery'
import _ from 'underscore'

import BackboneFire from 'bbfire'

var UserSecretsColl = BackboneFire.Firebase.Collection.extend({
  url: "",
  initialize: function(rf){
    this.url = rf.child('userSecrets')
  }
})


var HomeView = React.createClass({
  getInitialState: function(){
    return { userSecretColl: this.props.userSecrets }

  },

  _generateSecretsJSX: function(mdl,i){
    if(!mdl.get('theSecret')) return ''
    return (
      <li key={i}>
        <span className="usr">{mdl.get('username')}</span>
        --
        <span className="usr-secret">{mdl.get('theSecret')}</span>
      </li>
    )
  },

  componentDidMount: function(){
    var component = this
    this.props.userSecrets.on('sync', function(){
      console.log("SEEECRETS:", component.props.userSecrets.models)
      component.setState({
        userSecretColl: component.props.userSecrets
      })
    })
  },

  render: function(){
    // return (
    //   <div id="secrets-view">
    //     <h1>The Secrets</h1>
    //     <ul>
    //       <li>
    //         <span className="usr">tom</span>
    //         <span className="usr-secret">i ran over a guy</span>
    //       </li>
    //       <li>
    //         <span className="usr">jenny</span>
    //         <span className="usr-secret">i cheated on the SAT</span>
    //       </li>
    //       <li>
    //         <span className="usr">jill</span>
    //         <span className="usr-secret">i defrauded my bank</span>
    //       </li>
    //     </ul>
    //   </div>
    // )
    var component = this

    return (
      <div id="secrets-view">
        <h1>The Secrets</h1>
        <ul>
          {this.state.userSecretColl.models.map(component._generateSecretsJSX)}
        </ul>
      </div>
    )



  }
})

var AuthView = React.createClass({

  _handleSignUp: function(evt){
    var component = this
    var evt = evt
    evt.preventDefault()

    var emailInput    = evt.currentTarget.email.value
    var pwInput       = evt.currentTarget.password.value
    var userNameInput = evt.currentTarget.username.value
    var secretInput   = evt.currentTarget.secret.value


    fbRef.createUser(
      {
        email    : emailInput,  // internal to fb
        password : pwInput //internal to fb
      }, 
      function(err, authData){
        
        //create user secret
        var userSecretsColl = new UserSecretsColl(fbRef);

         userSecretsColl.create({
           username: userNameInput,
           theSecret: secretInput,
           uid: authData.uid
         })

         //notify app of authenticatedUser
         appRtr.authenticatedUser = authData.uid
         appRtr.navigate('',{trigger: true})


      })
  },

  _handleLogIn: function(evt){
    evt.preventDefault()

    var emailInput = evt.currentTarget.email.value
    var pwInput = evt.currentTarget.password.value

    fbRef.authWithPassword({
      email: emailInput,
      password: pwInput
    }, function(err, authData){
      console.log(authData)
      if(err){
        alert('sorry credentials not valid!')
      } else{
        appRtr.navigate('', {trigger: true})
      }
    })

  },

  render: function(){
    return (
      <div>
        <form onSubmit={this._handleSignUp}>
          <h3 className="signup">Sign Up And Tell Me Your Secret!</h3>
          <input type="text" id="email" placeholder="Email"/><br/>
          <input type="password" id="password" placeholder="Password"/><br/><br/>

          <input type="text" id="username" placeholder="Your Name"/><br/>
          <textarea type="text" id="secret" defaultValue="tell me your secret!!"/>
          <input className="button-primary" type="submit" defaultValue="Sign Up"/><br/>

        </form>
        <hr/>
        <form onSubmit={this._handleLogIn}>
          <h3 className="signin">Sign In</h3>
          <input type="text" id="email" placeholder="Email"/><br/>
          <input type="password" id="password" placeholder="Password"/><br/>
          <input className="button-primary" type="submit" defaultValue="Log In"/><br/>
        </form>
      </div>
    )
  }
})

var AppRouter = BackboneFire.Router.extend({
  routes: {
    "authenticate": 'showLogin',
    "*home": 'showHome'
  },

  showLogin: function(){
    DOM.render(<AuthView/>, document.querySelector('.container'))
  },

  showHome: function(){
      if(!this.authenticatedUser){
        this.navigate('authenticate', {trigger: true})
        return 
      }

      var theSecrets = new UserSecretsColl(fbRef)

      DOM.render(<HomeView userSecrets={theSecrets}/>, document.querySelector('.container'))
  },

  initialize: function(){
    var rtr = this

    // this.authenticatedUser = null
    
    fbRef.onAuth(function(authData){
      console.log('auth stuff herrrd', authData)
      if(authData){
        console.log('user is SO authenticated!')
        rtr.authenticatedUser = authData.uid
      } else {
        rtr.authenticatedUser = null
      }
    })


    BackboneFire.history.start();
  }

})

var appRtr = new AppRouter()