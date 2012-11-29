Meteor.startup ->
  Meteor.publish "userData", ->
    Meteor.users.find({_id: this.userId}, {fields:
      {remote: yes}})

  Meteor.publish "userRemote", ->
    throw new Meteor.Error(500, "Only active users can create a remote") if this.userId is null
    console.log "Publishing remote for user: ", Meteor.users.findOne(this.userId).remote
    Remotes.find(Meteor.users.findOne(this.userId).remote)

  Meteor.publish "currentClients", () ->
    Clients.find({remoteId: Meteor.users.findOne(this.userId).remote}, {
    fields:
      {
      time: no
      }
    })

  Meteor.publish "guestRemotes", (remoteId) ->
    Remotes.find(remoteId)


  checkClients = ->
    now = (new Date()).getTime()
    toRemove = []
    clients = Clients.find()
    count = clients.count()

    clients.forEach((client) ->
      toRemove.push(client._id) if now - client.time > 20000
    )
    Clients.remove({_id:
      {$in: toRemove}})
    console.log("Deleting #{toRemove.length}/#{count}", toRemove)

  Meteor.setInterval(checkClients, 10000)

