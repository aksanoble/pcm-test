$(function () {
  var app = app || {};

  //Defining Model
  app.Key = Backbone.Model.extend({
    defaults: {
      key: [0, 5, 10]
    },

    localStorage: new Backbone.LocalStorage("pcm-matrix")
  });


  // Main View
  app.View = Backbone.View.extend({

    el: '#mainview',

    events: {
      'click td': 'updateKey'
    },

    initialize: function () {
      this.model.on('all', this.render, this);

      this.model.fetch()
        .then(function () {
          this.render();
        }.bind(this));
    },
    updateKey: function (e) {
      var $cellIndex = $("td").index(e.target);
      var matrixKey = _.clone(this.model.get('key'));
      matrixKey[Math.floor($cellIndex / 5)] = $cellIndex;
      this.model.save({key: matrixKey});
    },

    addClass: function (cell) {
      console.log(cell);
      var $cell = $("td:eq(" + cell + ")");
      $cell.nextAll().removeClass("checked");
      $cell.prevAll().addBack().addClass("checked");
    },

    render: function () {
      var matrixCell = this.model.get('key');
      _.each(matrixCell, this.addClass);

    }
  });

  var App = new app.View({model: new app.Key({id: 27182})});
});