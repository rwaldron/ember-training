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

App.AlbumController = Ember.ObjectController.extend({
  totalDuration: function() {
    return this.get("songs").reduce(function( total, song ) {
      return (total += song.duration) && total;
    }, 0);
  }.property("songs.@each.duration")
});

App.NowPlayingController = Ember.ObjectController.extend();

/**
 * Views
 */

App.AudioView = Ember.View.extend({
  templateName: "audioControl",
  classNames: [ "audio-control" ],

  // View Specific State
  duration: 0,
  currentTime: 0,
  isPlaying: false,
  isLoaded: false,

  // View Rendering
  willDestroyElement: function() {
    Popcorn.instances.forEach(function( instance ) {
      instance.destroy();
      instance = null;
    });
  },
  didInsertElement: function() {
    var view = this;

    Popcorn("audio").on("canplayall", function() {
      // console.log( "canplayall", this );

      view.set( "duration", Math.floor(this.duration()) );
      view.set( "isLoaded", true );

      // isPlaying = true
      [
        "play", "playing"
      ].forEach(function( type ) {
        this.on( type, function() {
          view.set( "isPlaying", true );
        });
      }, this);

      // isPlaying = false
      [
        "pause", "ended", "waiting", "suspend", "stalled"
      ].forEach(function( type ) {
        this.on( type, function() {
          view.set( "isPlaying", false );
        });
      }, this);

      // currentTime = timeupdate(currentTime)
      this.on( "timeupdate", function() {
        view.set( "currentTime", this.roundTime() );
      });

      // if ( this.autoplay() ) {
        // this.play();
      // }

    });
  }
});

/**
 * Helpers
 */

Ember.Handlebars.helper( "audio-player", App.AudioView );

Ember.Handlebars.helper( "format-duration", function( value ) {
  var m = Math.floor( value / 60 );
  return [
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
})();
