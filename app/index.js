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

var $timerDisk = $('#timerDisk');
var $timerBarKnob = $('#timerBarKnob');
var $timerBarEnd = $('#timerBarEnd');
var $timerTime = $('#timerTime');
var $timerDirection = $('#timerDirection');

var timerType = "countdown";
function toggleTimerType(){
  var scaleX;
  var rotate;
  var directionImage;
  if(timerType == "countdown") {
    timerType = "countup";
    scaleX = -1;
    rotate = 360.0;
    directionImage = 'count_up.png';
  } else {
    timerType = "countdown";
    scaleX = 1;
    rotate = 0.0;
    directionImage = 'count_down.png';
  }
  $timerDisk.css({ 
    transform: 'scaleX(' + scaleX +')'
  });
  
  $timerDirection.css({ 
    transform: 'scaleX(' + scaleX + ')',
    backgroundImage: 'url(' + directionImage + ')'
  });
  
  startTimer();
}

var setSliderOrientation = function(deg){
  var containerRadius = $timerDisk.width() / 2;
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


var timer = new ProgressBar.Circle($timerDisk.get(0), {
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
    var deg = circle.value() * 360;
    setSliderOrientation(deg);
    
    var valueSeconds = Math.round(circle.value() * DURATION_IN_SECONDS);
    if(valueSeconds != circle.valueSeconds){
      $timerTime.text(seconds2Date(valueSeconds).toISOString().substr(14, 5));
      circle.valueSeconds = valueSeconds;
    }
  }
});
timer.svg.style.transform= 'scale(-1, 1)';

var setTimer = function(deg){
  var startValue = timerType == "countdown" ? 1.0 : 0.0;
  var newValue = Math.abs(startValue - (deg / 360.0));
  timer.set(newValue);
}

var startTimer = function(){
  var finishValue = timerType == "countdown" ? 0.0 : 1.0;
  var valueDiff = Math.abs(finishValue - timer.value());
  timer.animate(finishValue, { 
    duration: DURATION_IN_SECONDS * 1000 * valueDiff
  }, function(){
    new Audio(ALARM_SOUND_FILE).play();
  });
}

var stopTimer = function(){
  timer.stop();
}

var oldSliderDeg = null;
var countainerMousedown = false;
$timerDisk
  .bind('mousedown touchstart', function(e) {
    countainerMousedown = true;
    stopTimer();
    e.originalEvent.preventDefault();
  })
  .bind('mousemove touchmove', function(e) {
    if (countainerMousedown) {
      var containerOffset = $timerDisk.offset();
      var movePos = {
        x: (e.pageX||e.originalEvent.touches[0].pageX)- containerOffset.left,
        y: (e.pageY||e.originalEvent.touches[0].pageY) - containerOffset.top
      };
      var containerRadius = $timerDisk.width() / 2;
      var atan = Math.atan2(movePos.x - containerRadius, movePos.y - containerRadius);
      var deg = -atan / (Math.PI / 180.0) + 180.0;

      if (oldSliderDeg === null ||  Math.abs(deg - oldSliderDeg) <= 60){
        setTimer(deg);
        oldSliderDeg = deg;
      }
    }
  })
  .bind('mouseup touchend', function(e) {
    countainerMousedown = false;
    startTimer();
  });

$timerTime.bind('mousedown touchstart', toggleTimerType);

// Initial Time
timer.animate(10/60, startTimer);

