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

var timerLastDegree = 0;

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
  
  $timerTime.css({ animation: 'none' });
  setTimeout(function() { $timerTime.css({ animation: '' }); });
  
  $timerDirection.css({ animation: 'none' });
  setTimeout(function() { $timerDirection.css({ animation: '' }); });
  
  $timerDirection.css({ 
    backgroundImage: 'url(' + directionImage + ')'
  });

  timerLastDegree = 360.0 - timerLastDegree;

  startTimer();
}

var updateTimerBar = function(timer, state){
  timer.path.setAttribute('stroke', state.color);
  
  var containerRadius = $timerDisk.width() / 2.0;
  var rotation = timer.value() * 360.0;
  var position = {
    x: - Math.sin(rotation * Math.PI / 180.0) * containerRadius + containerRadius,
    y: - Math.cos(rotation * Math.PI / 180.0) * containerRadius + containerRadius
  };
  $timerBarEnd.css({ 
    transformOrigin: 'top',
    transform: 'translate(' + (position.x - $timerBarEnd.width() / 2.0) + 'px,' + position.y + 'px)' + ' rotate(' + -rotation + 'deg)'
  });
  $timerBarKnob.css({ 
    transform: 'translate(' + (position.x - $timerBarKnob.width() / 2.0) + 'px,' + (position.y - $timerBarKnob.height() / 2.0) + 'px)' 
  });
}

var updateTimerTime = function(timer, state){
  var valueSeconds = Math.round(timer.value() * DURATION_IN_SECONDS);
  if(valueSeconds != timer.valueSeconds){
    $timerTime.text(seconds2Date(valueSeconds).toISOString().substr(14, 5));
    timer.valueSeconds = valueSeconds;
  }
}

var timer = new ProgressBar.Circle($timerDisk.get(0), {
  color: 'inherit', // inherit to support css styling
  trailWidth: 40,
  trailColor: 'inherit', // inherit to support css styling
  strokeWidth: 37,
  duration: 1 * 1000,
  from: { color: '#c11535' },
  to:   { color: '#a21630' },
  step: function(state, timer) {
    updateTimerBar(timer, state);
    updateTimerTime(timer, state);
  }
});
timer.svg.style.transform= 'scale(-1, 1)';

var setTimer = function(deg){
  var startValue = timerType == "countdown" ? 0.0 : 1.0;
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
      var deg = atan / (Math.PI / 180.0) + 180.0;

      var targetDeg = deg;
      if (timerLastDegree < 90.0 && deg > 270.0 ){
        targetDeg = 0.0;
      } else if (timerLastDegree > 270.0 && deg < 90.0 ){
        targetDeg = 360.0;
      } 
      
      timerLastDegree = targetDeg;
      setTimer(targetDeg);
    }
  })
  .bind('mouseup touchend', function(e) {
    countainerMousedown = false;
    startTimer();
  });

$timerTime.bind('click tap', toggleTimerType);

// Initial Time 10 Minutes
timer.animate(60/360, function() {
  setTimer(60);
  startTimer();
});

