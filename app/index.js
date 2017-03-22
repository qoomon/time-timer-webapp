"use strict";

var DURATION_IN_SECONDS = 60 * 60; // 60 minutes
var ALARM_SOUND_FILE = 'alarm.mp3';

var $ = require('jquery');
var ProgressBar = require('progressbar.js');

function seconds2Date(seconds){
  var date = new Date(null);
  date.setSeconds(seconds);
  return date;
}

var $timerContainer = $('#timerContainer');
var $timerBarKnob = $('#timerBarKnob');
var $timerBarEnd = $('#timerBarEnd');

var setSliderOrientation = function(deg){
  var containerRadius = $timerContainer.width() / 2;
  var pos = {
    x: - Math.sin(deg * Math.PI / 180) * (containerRadius - 10) + containerRadius,
    y: - Math.cos(deg * Math.PI / 180) * (containerRadius - 10) + containerRadius
  }
  $timerBarEnd.css({ 
    transformOrigin: 'top',
    transform: 'translate(' + (pos.x - $timerBarEnd.width() / 2) + 'px,' + pos.y + 'px)' + ' rotate(' + -deg + 'deg)'
  });
  $timerBarKnob.css({ 
    transform: 'translate(' + (pos.x - $timerBarKnob.width() / 2 )+ 'px,' + (pos.y - $timerBarKnob.height() / 2) + 'px)' 
  });
}

var timer = new ProgressBar.Circle($timerContainer.get(0), {
  color: 'inherit', // inherit to support css styling
  trailWidth: 40,
  trailColor: 'inherit', // inherit to support css styling
  strokeWidth: 37,
  duration: 1 * 1000,
  from: { 
    color: '#c11535',
  },
  to: { 
    color: '#a21630',
  },
  // Set default step function for all animate calls
  step: function(state, circle) {
    circle.path.setAttribute('stroke', state.color);
    var remainingSeconds = Math.round(circle.value() * DURATION_IN_SECONDS);
    circle.setText(seconds2Date(remainingSeconds).toISOString().substr(14, 5));
    var deg = circle.value() * 360;
    setSliderOrientation(deg);
  }
});
timer.svg.style.transform= 'scale(-1, 1)';
timer.text.style.fontFamily = 'Helvetica';
timer.text.style.fontSize = '2rem';

var setTimer = function(deg){
  timer.set(1 - (deg / 360.0));
}

var startTimer = function(){
  timer.animate(0.0, { duration: DURATION_IN_SECONDS * 1000 * timer.value() }, function(){
    new Audio(ALARM_SOUND_FILE).play();
  });
}

var stopTimer = function(){
  timer.stop();
}

var oldSliderDeg=null;
var countainerMousedown = false;
$timerContainer
  .bind('mousedown touchstart', function(e) {
    countainerMousedown = true;
    stopTimer();
    e.originalEvent.preventDefault();
  })
  .bind('mousemove touchmove', function(e) {
    if (countainerMousedown) {
      var containerOffset = $timerContainer.offset();
      var movePos = {
        x: (e.pageX||e.originalEvent.touches[0].pageX)- containerOffset.left,
        y: (e.pageY||e.originalEvent.touches[0].pageY) - containerOffset.top
      };
      var containerRadius = $timerContainer.width() / 2;
      var atan = Math.atan2(movePos.x - containerRadius, movePos.y - containerRadius);
      var deg = -atan / (Math.PI / 180) + 180;

      if (oldSliderDeg === null ||  Math.abs(deg - oldSliderDeg) <= 60){
        console.log(Math.abs(deg - oldSliderDeg));
        setTimer(deg);
        oldSliderDeg=deg;
      }
    }
  })
  .bind('mouseup touchend', function(e) {
    countainerMousedown = false;
    startTimer();
  });

// Initial Time
timer.animate(10/60, startTimer);

