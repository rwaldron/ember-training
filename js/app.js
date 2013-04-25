(function() {
"use strict";

window.App = Ember.Application.create();

/**
 * Routes
 */
App.Router.map(function() {
  this.resource( "album", {
    path: "/album/:album_id"
  });
});

App.ApplicationRoute = Ember.Route.extend({
  events: {
    play: function( song ) {
      this.controllerFor("nowPlaying").set( "model", song );
    }
  }
});

App.IndexRoute = Ember.Route.extend({
  model: function() {
    return App.ALBUM_FIXTURES;
  }
});

App.AlbumRoute = Ember.Route.extend({
  model: function( params ) {
    return App.ALBUM_FIXTURES.findProperty(
      "id", params.album_id
    );
  }
});

/**
 * Controllers
 */

App.NowPlayingController = Ember.ObjectController.extend();

App.SongController = Ember.ObjectController.extend({
  needs: [ "nowPlaying" ],
  isPlaying: function() {
    return this.get("controllers.nowPlaying.model") === this.get("model");
  }.property("controllers.nowPlaying.model", "model"),
});

App.AlbumController = Ember.ObjectController.extend({
  totalDuration: function() {
    return this.get("songs").reduce(function( total, song ) {
      return (total += song.duration) && total;
    }, 0);
  }.property("songs.@each.duration")
});

/**
 * Views
 */

App.AudioView = Ember.View.extend({
  templateName: "audioControl",
  classNames: [ "audio-control" ],

  // View Specific State
  currentTime: 0,
  isPlaying: false,
  isLoaded: false,
  isShowRemaining: false,

  // View Rendering (Ember Hooks)
  willDestroyElement: function() {
    /**
     * http://emberjs.com/api/classes/Ember.View.html#event_willDestroyElement
     */
    Popcorn.instances.forEach(function( instance ) {
      instance.destroy();
      instance = null;
    });
  },
  didInsertElement: function() {
    var view = this;

    Popcorn("audio").on("canplayall", function() {
      // Event handlers returned by calls to "schedule()"
      // are pre-rolled with Ember.run(callback)
      view.set( "isLoaded", true );

      // isPlaying = true
      [
        "play" // , "playing"
      ].forEach(function( type ) {
        this.on( type, schedule(function() {
          view.set( "isPlaying", true );
        }));
      }, this);

      // isPlaying = false
      [
        "pause" //, "ended", "waiting", "suspend", "stalled"
      ].forEach(function( type ) {
        this.on( type, schedule(function() {
          view.set( "isPlaying", false );
        }));
      }, this);

      // currentTime = timeupdate(currentTime)
      this.on( "timeupdate", schedule(function() {
        var remaining = view.get("duration") - this.roundTime();

        view.set( "currentTime", this.roundTime() );

        if ( view.get("isShowRemaining") ) {
          view.set(
            "remaining", remaining === NaN ?
              view.get("duration") : remaining
          );
        }
      }.bind(this)));
    });
  },

  // View Action Handlers
  play: function() {
    // isPlaying = true
    this.set("isPlaying", true);
    Popcorn.instances[0].play();
  },
  pause: function() {
    // isPlaying = false
    this.set("isPlaying", false);
    Popcorn.instances[0].pause();
  },
  toggle: function() {
    var isShowRemaining = this.get("isShowRemaining");

    this.set("isShowRemaining", !isShowRemaining);
  }
});

/**
 * Helpers
 */

Ember.Handlebars.helper( "audio-player", App.AudioView );

Ember.Handlebars.helper( "format-duration", function( value ) {
  var m = Math.floor( value / 60 );
  return Number.isNaN(m) ? "" : [
    lpad( m, (m + "").length, "0" ),
    lpad( value % 60, 2, "0" )
  ].join(":");
});

/**
 * Misc
 */

function lpad( str, n, char ) {
  return String(
    Array.apply( null, { length: n }).map(function() {
      return char;
    }) + str
  ).slice( -n );
}

function schedule( callback ) {
  return function() {
    Ember.run( callback );
  };
}
})();
