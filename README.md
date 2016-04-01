###Instructions

###1- New firebase app
1-- setup endpoint `userSecrets: "" `
2-- configure authentication in 'Login & Auth' : 'Enable Email And Password Auth'

###2- npm installs  --- jquery, underscore, bbfire, firebase, bbfire

###3- setup router for authentication
```js

var AppRouter = BackboneFire.Router.extend({
  routes: {
    "*home": 'showHome'
  },


  showHome: function(){
      DOM.render(<p>Welcom Home!</p>, document.querySelector('.container'))
  },

  showAuthPage: function(){
      DOM.render(<p>Authenticate Please! </p>,document.querySelector('.container'))
  },

  initialize: function(){
    console.log('app routing')
    authenticatedUser = null
    BackboneFire.history.start();
  }

})
```

###4- setup viewController React components
- ShowSecrets
- ViewController_Authenticate

###5- Create `_handleSignUp` to gather info off form

**Part 1--- capture form-values and createUser with Fb Auth**
```js
var evt = evt
evt.preventDefault()

var emailInput    = evt.currentTarget.email.value
var pwInput       = evt.currentTarget.password.value
var userNameInput = evt.currentTarget.username.value
var secretInput   = evt.currentTarget.secret.value

fbRef.createUser(
  {
    email    : evt.currentTarget.email.value,  // internal to fb
    password : evt.currentTarget.password.value //internal to fb
  }...)
```

**Part 2--- handle response and save 'secret' To DB**
```js
function(err, authData){
        //create user secret
        var userSecretsColl = new UserSecretsColl(fbRef);
         userSecretsColl.create({
           username: userNameInput,
           theSecret: secretInput,
           uid: authData.uid
         })
      ...)
}
```

**Part 3--- notify application of authenticated user**
```js
     appRtr.authenticatedUser = authData.uid
     appRtr.navigate('',{trigger: true})
```


###5- Create `_handleLogin` to gather info off form
```js
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
    // appRtr.initialize will be listening for changes in auth status!
    appRtr.navigate('', {trigger: true})
  }
})
```

###6- catch auth status in router
```js
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
}
```

###7- Configure `showHome`
---showHome
```
showHome: function(){
    if(!this.authenticatedUser){
      this.navigate('authenticate', {trigger: true})
      return 
    }

    var theSecrets = new UserSecretsColl(fbRef)

    DOM.render(<HomeView userSecrets={theSecrets}/>, document.querySelector('.container'))
},
```

###8- Configure HomeView
--1 Put Props On State
```
getInitialState: function(){
  return { userSecretColl: this.props.userSecrets }

}
```

--2 Build the Render Method
```
render: function(){

    return (
      <div id="secrets-view">
        <h1>The Secrets</h1>
        <ul>
          {this.state.userSecretColl.models.map(component._generateSecretsJSX)}
        </ul>
      </div>
    )
  }  
```

--3 Build the Helper Method
```
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
```

--4 Build the Data syncer
```
componentDidMount: function(){
   var component = this
   this.props.userSecrets.on('sync', function(){
     console.log("SEEECRETS:", component.props.userSecrets.models)
     component.setState({
       userSecretColl: component.props.userSecrets
     })
   })
 },
```


###9- Logout

  
