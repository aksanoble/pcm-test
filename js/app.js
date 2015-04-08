$(function () {
  var app = app || {};

//Defining Model
  app.Key = Backbone.Model.extend({});

  // Defining Collection
  app.Keys = Backbone.Collection.extend({

    model: app.Key,

    localStorage: new Backbone.LocalStorage("pcm-matrix")

  });

// Main View
  app.View = Backbone.View.extend({

    el: '#mainview',
    //template: _.template($('#mymodel-template').html()),

    events: {
      'click td': 'updateKey'
    },

    initialize: function () {
      this.collection.fetch();
      return this.render();
    },
    updateKey: function (e) {
      var $cellIndex = $("td").index(e.target);
      var matrixKey = _.clone(this.collection.find('key')); //Using clone as if referred to the same  object does not trigger changed event
      matrixKey[Math.floor($cellIndex / 5)] = $cellIndex;
      this.collection.create({key: matrixKey});
    },

    addClass: function (cell) {
      var $cellEl = $("td:eq(" + cell + ")");
      $cellEl.nextAll().removeClass("checked");
      $cellEl.prevAll().addBack().addClass("checked");
    },

    render: function () {
      var matrixCell = this.collection.find('key');
      _.each(matrixCell, this.addClass);
      return this;
    }
  });

  var App = new app.View({collection: new app.Keys()});
});
