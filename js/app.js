$(function () {
  var app = app || {};
  uuid = PUBNUB.uuid();
      pubnub = PUBNUB.init({
          publish_key   : 'demo',
          subscribe_key : 'demo'
      });

      pubnub.time(function(time){
          console.log(time);
      });

  var subscribeObj = {
    channel : 'test11',
    message : function( message, env, channel ){
              // RECEIVED A MESSAGE.
               console.log("message received");
               var wireStat = message;
               console.log(wireStat);
               var currentStat = app.stat.get('stats');
               //console.log(currentStat);
               var totalHitsOnWire = _.reduce(_.first(wireStat, 4), function(sum, el) {
                   return sum + el;}, 0);

               var totalHitsCurrent = _.reduce(_.first(currentStat, 4), function(sum, el) {
                       return sum + el;}, 0);

               if (totalHitsOnWire > totalHitsCurrent ) {
                         app.stat.set({stats: wireStat});
                         app.stat.save();
                         App.updatePopover();
               }
              },

    connect: function() {
               /*pubnub.publish({
                  channel : 'test11',
                  message : app.stat.get('stats'),
                  callback: function(m){ console.log("sent!"); }
                });*/
                  pubnub.history({
                   channel: 'test11',
                   count: 1,
                   callback: function(m){
                    console.log((m[0][0]));
                    app.stat.set({stats: m[0][0]});
                    app.stat.save();
                    App.updatePopover();}
                  });
             },
    disconnect: function(){console.log("Disconnected");},
    reconnect: function(){console.log("Reconnected");},
    error: function(){console.log("Network Error");},};

  pubnub.subscribe(subscribeObj);

  $('td:not(:first-child').popover({
  title: '',
  container: 'body',
  placement: 'top',
  trigger: 'hover'
  });

  app.Stat = Backbone.Model.extend({
    defaults: {
      stats: [[0,0,0,0],[0,0,0,0],[0,0,0,0]]
    },

    initialize: function() {this.fetch();},

    localStorage: new Backbone.LocalStorage("pcm-stat")
  });

  app.stat = new app.Stat({id:4890});


  //Defining Matrix Key Model
  app.Key = Backbone.Model.extend({
    defaults: {
      key: [0, 0, 0]
    },

    localStorage: new Backbone.LocalStorage("pcm-matrix")
  });

  // Main View
  app.View = Backbone.View.extend({

    el: '#mainview',

    events: {
      'click td': 'updateKey',
      //'click button': 'updateStat'
      'click button': 'onSubmit'
    },

    onSubmit: function() {
      this.updateStat();
      this.updatePopover();
      this.publishNow();
    },

    publishNow: function() {pubnub.publish({
      channel : 'test11',
      message : app.stat.get('stats'),
      callback: function(m){ console.log("sent!"); }
    });},

    initialize: function () {
      this.model.on('all', this.render, this);
      //this.model.on('change', this.updateStat, this);

      this.model.fetch();
      this.updateStat();
      this.updatePopover();
      this.render();

    },
    updateKey: function (e) {
      var $cellIndex = $("td").index(e.target);
      //console.log($cellIndex);
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
      var currentStat = _.clone(app.stat.get('stats'));
      _.map(currentStat, increment);
       function increment (value, index){
        ++value[matrixCell[index]-1];
      }
      app.stat.set({stats: currentStat});
      app.stat.save();
    },

    updatePopover: function() {
      var currentStats = app.stat.get('stats');
      var flatStat = _.flatten(_.map(currentStats, _.values));
      var totalHits = _.reduce(_.first(flatStat, 4), function(sum, el) {
          return sum + el;}, 0).toString();

      _.map(flatStat, function(data, cell){
        cell = cell;
        var statString = data.toString() + "/" + totalHits;
        var $cell = $("td:not(:first-child):eq(" + cell+ ")");
        $cell.attr('data-content', statString).data('bs.popover').setContent();
      });

    }

  });
  var App = new app.View({model: new app.Key({id: 27182})});
});
