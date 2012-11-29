do ->
  Accounts.onCreateUser (options, user) ->
    if options.profile
      user.profile = options.profile

    #create remote for this user
    user.remote = Remotes.insert
      url: "http://google.com"

    console.log user

    return user

  Remotes.allow
    update: (userId, docs, fields, modifier) ->
      user = Meteor.users.findOne userId
      return docs.length is 1 and docs[0]._id is user.remote

  Clients.allow
    insert: (userId, doc) ->
      doc.time = (new Date()).getTime()
      yes

  Meteor.methods
    clientHeartbeat: (clientId) ->
      Clients.update(clientId, {
      $set:
        {
        time: (new Date()).getTime()
        }
      })