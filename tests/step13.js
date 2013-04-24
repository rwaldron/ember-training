/*
  In this step, you'll implement a feature that shows the duration of the
  currently playing song. If you click on it, it should hide the total duration
  and show the time remaining.

  Remember, if you want to reference the duration in your template, you should
  use `view.duration`.

  By now, this should be a pretty simple feature for you to implement. Just use
  the concepts you put to use yesterday.

  To increase the challenge, this time, you'll be writing your own tests. First,
  write a test to describe the feature. Then, begin implementing it until all
  of your tests pass.

  Here are a couple things we suggest you test:

  * If no song is playing, the current time should not appear.
  * When you play a song, the current time should appear in the Now Playing panel.
  * When you click on the current time, it should show the remaining time.

  Note: You'll probably need to use jQuery to set up a listener to know when the
  song has loaded. Because these tests are asynchronous, make sure you use QUnit's
  start() and stop() methods. If you finish this early, you should write a helper
  to clean up this code.

  Good luck!
*/

step(13, "Click to Toggle Remaining Time");

testView(App.AudioView, "the view displays the duration", function(view) {
  Ember.run(function() {
    view.set( "src", "audio/Southern_Nights_-_07_-_All_My_Sorrows.mp3" );
  });

  waitFor( view, "isPlaying", function() {
    viewShouldHaveElement(
      view, "button.now-playing-duration", 1,
      "The view should contain a time display for the duration"
    );
  });
});

testView(App.AudioView, "clicking duration toggles displayed value", function(view) {
  Ember.run(function() {
    view.set( "src", "audio/Southern_Nights_-_07_-_All_My_Sorrows.mp3" );
  });

  waitFor( view, "isPlaying", function() {
    click( "button.now-playing-duration", view );
    equal( view.get("isShowRemaining"), true, "isShowRemaining is true" );

    click( "button.now-playing-duration", view );
    equal( view.get("isShowRemaining"), false, "isShowRemaining is false" );
  });
});
