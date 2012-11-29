appState = do() ->
  SESSION_KEY = "appstate_current"

  appState =
    HOME: "home"
    PLAYGROUND: "playground"
    REMOTE: "remote"
    NOT_FOUND: "not_found"

    setState: (state) ->
      Session.set(SESSION_KEY, state)

    getState: ->
      Session.get(SESSION_KEY)

    isState: (state) ->
      @getState() is state


  appState.setState(null)

  Meteor.autorun ->
    state = appState.getState()

  return appState  