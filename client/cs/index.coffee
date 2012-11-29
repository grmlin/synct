Meteor.startup ->
  home = new HomeView "home"


  index = ->
    appState.setState appState.HOME

  playground = (ctx) ->
    Meteor._debug("opening playground for #{ctx.params.id}")
    appState.setState appState.PLAYGROUND

    head= document.getElementsByTagName('head')[0]
    script= document.createElement('script')
    script.type = 'text/javascript'
    script.src = home.getScriptUrl(ctx.params.id)
    head.appendChild(script)


  # IFRAME magic
  remote = (ctx) ->
    appState.setState appState.REMOTE
    Meteor._debug("pushing urls for #{ctx.params.id}")


    if top isnt self
      client = Clients.insert
        what: navigator.userAgent  
        remoteId: ctx.params.id
      
      top.postMessage(JSON.stringify({type: "SYNCT:ONLOAD"}), "*")
      
      window.addEventListener "message", (evt) ->
        
        if evt.source is top and JSON.parse(evt.data).type is "SYNCT:ALIVE"
          console.log "Still connected #{client}"
          Meteor.call "clientHeartbeat", client
      
      guestRemoteHandle = Meteor.subscribe "guestRemotes", ctx.params.id

      Meteor.autorun ->
        #Meteor._debug "current url: ", Remotes.findOne(ctx.params.id).url
        update =
          type: "SYNCT:ONCHANGE"
          url: Remotes.findOne(ctx.params.id)?.url

        top.postMessage(JSON.stringify(update), "*") if update.url isnt undefined


  notfound = ->
    appState.setState appState.NOT_FOUND


  page "/", index
  page "/playground/:id", playground
  page "/remote/:id", remote
  page "*", notfound

  page()

  Accounts.ui.config
    passwordSignupFields: 'USERNAME_ONLY'

    
  Meteor.autosubscribe ->
    user = Meteor.userId()

    if user is null
      remoteHandle?.stop()
      userHandle?.stop()
      clientRemoteHandle?.stop()
    else
      remoteHandle = Meteor.subscribe "userRemote"
      userHandle = Meteor.subscribe "userData"
      clientRemoteHandle = Meteor.subscribe "currentClients"