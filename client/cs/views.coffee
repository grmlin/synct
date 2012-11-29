Handlebars.registerHelper 'show_view', (viewNames) ->
  show = no
  names = viewNames.split(',')
  names.forEach((name) ->
    show = yes if appState.isState(name)
  )

  return show

Handlebars.registerHelper 'equal', (a, b) ->
  a is b


HomeView = Meteor.View.create
  elements:
    "input.target-url": "target"

  helpers:
    "remote": "getRemote"
    "script_url": "getScriptUrl"
    "clients": "getClients"
    "client_count": "getClientCount"

  events:
    "submit #remote-control": "onNewUrl"

  _remoteItem: ->
    Remotes.findOne(Meteor.user()?.remote)

  getRemote: ->
    @_remoteItem()

  getScriptUrl: (remoteId) ->
    return "#{window.location.protocol}//#{window.location.host}/rc.js?remote=#{remoteId}"

  getClients: (remoteId) ->
    Clients.find({remoteId: remoteId})

  getClientCount: (coll) ->
    coll.count()

  onNewUrl: (evt) ->
    evt.preventDefault();
    Meteor._debug "updating target URL: #{@target[0].value}"

    remote = @_remoteItem()
    unless remote is null
      Remotes.update remote._id,
        $set:
          url: @target[0].value