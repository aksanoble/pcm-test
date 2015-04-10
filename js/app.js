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

  pubnub.subscribe({
   channel : 'test11',
   message : function( message, env, channel ){
      // RECEIVED A MESSAGE.
      console.log(message);
   },
   connect: function(){
     console.log("Connected");
     pubnub.publish({
       channel : 'test11',
       message : "Hello from aksn",
       callback: function(m){ console.log("sent!"); }
     });},
     disconnect: function(){console.log("Disconnected");},
     reconnect: function(){console.log("Reconnected");},
     error: function(){console.log("Network Error");},

});

/*
      pubsub = {
        sub: function() {
          pubnub.subscribe({
            channel: 'test11',
            message: function(m){console.log("received!");},
            error: function (error) {
                    console.log(JSON.stringify(error));}
          });
          return true;
        },

        pub: function() {
          pubnub.publish({
          channel : 'test11',
          message : "Hello from aksn",
          callback: function(m){ console.log("sent!"); }
        });
        },

        initialize: function() {
        this.sub()
        .then(function(){
            this.pub();
        }.bind(this));
      }
    };

      pubsub.initialize();
*/
      //subscribe().then(app.publish);

  $('td:not(:first-child').tooltip({
  title: '',
  container: 'body'
  });



  app.Stat = Backbone.Model.extend({
    defaults: {
      stats: [[0,0,0,0],[0,0,0,0],[0,0,0,0]]
    },

    localStorage: new Backbone.LocalStorage("pcm-stat")
  });

  app.stat = new app.Stat({id:4890});

  app.stat.fetch();



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
      'click button': 'publishNow'
    },

    publishNow: function() {pubnub.publish({
      channel : 'test11',
      message : "Hello from aksn",
      callback: function(m){ console.log("sent!"); }
    });},

    initialize: function () {
      this.model.on('all', this.render, this);
      //this.model.on('change', this.updateStat, this);

      this.model.fetch();
      this.updateStat();
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
    //  console.log(matrixCell);
      var cellKey = _.map(matrixCell, function(num, i){ return i * 5 + num; });
    //  console.log(cellKey);
      _.each(cellKey, this.addClass);

    },

    updateStat: function() {
      var matrixCell = this.model.get('key');
      //console.log(matrixCell);
      var currentStat = _.clone(app.stat.get('stats'));
      //console.log(currentStat);
      _.map(currentStat, increment);
       function increment (value, index){
        ++value[matrixCell[index]-1];
      }
      app.stat.set({stats: currentStat});
      //console.log(currentStat);
      app.stat.save();
      this.updateDisplay();

    },

    updateDisplay: function() {
      var currentStats = app.stat.get('stats');
      var flatStat = _.flatten(_.map(currentStats, _.values));
      var totalHits = _.reduce(_.first(flatStat, 4), function(sum, el) {
          return sum + el;}, 0).toString();
      //console.log(totalHits);
      //console.log(flatStat);
      _.map(flatStat, function(data, cell){
        cell = cell;
        var statString = data.toString() + "/" + totalHits;
        var $cell = $("td:not(:first-child):eq(" + cell+ ")");
        $cell.attr('title', statString).tooltip('fixTitle').tooltip();
      });

    }

  });

  var App = new app.View({model: new app.Key({id: 27182})});
});
