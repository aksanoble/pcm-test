$(function() {
  var app = app || {};

//Defining Model
  app.Key = Backbone.Model.extend({
    defaults: function() {
      return {
        key: [0,5,10]
      };
    }
  });

  app.key = new app.Key();

  // Defining Collection
  app.Keys = Backbone.Collection.extend({

  model: app.Key,

  localStorage: new Backbone.LocalStorage("pcm-matrix")

  });

  app.keys = new app.Keys();

// Main View
  app.View = Backbone.View.extend({

    el: '#mainview',
    //template: _.template($('#mymodel-template').html()),

    events: {
      'click td' : 'updateKey',
      },

    model: app.key,

    initialize: function() {
      this.listenTo(this.model, 'all', this.render);
      app.keys.fetch();
      return this.render();
    },
    updateKey: function(e) {
      console.log("clicked!");
      cellIndex = $("td").index(e.target);
      console.log(cellIndex);
      matrixKey = _.clone(this.model.get('key')); //Using clone as if referred to the same  object does not trigger changed event
      matrixKey[Math.floor(cellIndex/5)] = cellIndex;
       app.key.save({key : matrixKey});
    },

    addClass: function(cell) {
      console.log(cell);
      $("td:eq(" + cell+ ")").nextAll().removeClass("checked");
      $("td:eq(" + cell+ ")").prevAll().addBack().addClass("checked");
    },

    render: function() {
      //this.$('#mymodel').html(this.template(app.key.toJSON()));
      console.log('render triggered');
      var matrixCell = app.key.get('key');
      _.each(matrixCell, this.addClass);
      //this.addClass(mymodel.get('key'));

    }
  });

  var App = new app.View();
});
