$(function () {
  var app = app || {};

  // PubNub initialize
  uuid = PUBNUB.uuid();
      pubnub = PUBNUB.init({
          publish_key   : 'demo',
          subscribe_key : 'demo'
      });

      pubnub.time(function(time){
          console.log(time);
      });

  // Define Subscribe Object for PubNub Subscribe
  var subscribeObj = {
    channel : 'pcm-stats',

  // On receiving message update Stats model
    message : function( message, env, channel ){
      console.log("message received");
      var wireStat = message;
      var currentStat = app.popOverView.model.get('stats');
  // Count total submissions
      var totalHitsOnWire = _.reduce(_.first(wireStat, 4), function(sum, el) {
        return sum + el;}, 0);

      var totalHitsCurrent = _.reduce(_.first(currentStat, 4), function(sum, el) {
        return sum + el;}, 0);
  // Update stats model if submissions on wire is more then local
      if (totalHitsOnWire > totalHitsCurrent ) {
        app.popOverView.model.set({stats: wireStat});
        app.popOverView.model.save();
        }
    },
  // Fetch initial stats from PubNub wire on Connect
    connect: function() {
      pubnub.history({
        channel: 'pcm-stats',
        count: 1,
        callback: function(m){
          app.popOverView.model.set({stats: m[0][0]});
          app.popOverView.model.save();
        }
      });
    },

    disconnect: function(){
      console.log("Disconnected");},
    reconnect: function(){
      console.log("Reconnected");},
    error: function(){
      console.log("Network Error");}

  };

  // Define Backbone Stats model
  app.Stat = Backbone.Model.extend({
    defaults: {
      stats: [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]
    },

    localStorage: new Backbone.LocalStorage("pcm-stat")
  });

  //Defining Backbone Model for table cells
  app.Key = Backbone.Model.extend({
    defaults: {
      key: [0, 0, 0, 0, 0, 0]
    },

    localStorage: new Backbone.LocalStorage("pcm-matrix")
  });

  // Backbone Main View
  app.View = Backbone.View.extend({

    el: '#mainview',

    events: {
      'click td': 'updateKey',
      'click #publish': 'onSubmit'

    },

    onSubmit: function() {
      this.updateStat();
      this.publishNow();
      this.events["click td"] = undefined;
      this.events["click button"] = undefined;
      this.delegateEvents(this.events);
      $('#confirm').modal('hide');
      $('.navbar-text').removeClass('hidden');
      $('button').addClass('hidden');
    },

    publishNow: function() {pubnub.publish({
      channel : 'pcm-stats',
      message : app.popOverView.model.get('stats'),
      callback: function(m){console.log("sent!");}
      });
    },

    initialize: function () {
      this.model.on('all', this.render, this);
      this.render();
    },

    updateKey: function (e) {
      var $cellIndex = $("td").index(e.target);
      var matrixKey = _.clone(this.model.get('key'));
      matrixKey[Math.floor($cellIndex / 5)] = $cellIndex % 5;
      this.model.save({key: matrixKey});
    },

    addClass: function (cell) {
      var $cell = $("td:eq(" + cell + ")");
      $cell.nextAll().removeClass("checked");
      $cell.prevAll().addBack().addClass("checked");
    },

    render: function () {
      var matrixCell = this.model.get('key');
      var cellKey = _.map(matrixCell, function(num, i){ return i * 5 + num; });
      _.each(cellKey, this.addClass);

    },

    updateStat: function() {
      var matrixCell = this.model.get('key');
      var currentStat = _.clone(app.popOverView.model.get('stats'));
      _.map(currentStat, function (value, index){
       ++value[matrixCell[index]-1];
      });
      app.popOverView.model.set({stats: currentStat});
      app.popOverView.model.save();
    },

  });

  //Inititialize new App View
  var App = new app.View({model: new app.Key({id: 27182})});

  // Define Backbone view for Popover

    app.PopOverView = Backbone.View.extend({

    el: $("td:not(:first-child)"),

    render : function(event) {
      var currentStats = this.model.get('stats');
      var flatStat = _.flatten(_.map(currentStats, _.values));
      var totalHits = _.reduce(_.first(flatStat, 4), function(sum, el) {
        return sum + el;}, 0).toString();

      _.map(flatStat, function(data, cell){
        var statString = data.toString() + "/" + totalHits;
        var $cell = $("td:not(:first-child):eq(" + cell+ ")");
        $cell.attr('data-content', statString).data('bs.popover').setContent();
      });
    },

    initialize: function () {
      $el = this.$el;
      $el.popover({
        title: '',
        trigger: 'hover',
        container: 'body',
        placement: 'top',
      });
      pubnub.subscribe(subscribeObj);
      this.model.on('all', this.render, this);
    }
  });

  app.popOverView = new app.PopOverView({model: new app.Stat({id:4890})});
});
