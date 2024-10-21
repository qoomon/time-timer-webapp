"use strict";

var DURATION_IN_SECONDS = 60 * 60; // 60 minutes

var $ = global.$ = window.$ = global.jQuery = window.jQuery = require('jquery');
require('jquery-ui-effects');
var ProgressBar = require('progressbar.js');
var STORAGE = {
  domainKey: (key) => 'time-timer/' + key,
  setObject(key, value) {
      localStorage.setItem(this.domainKey(key), JSON.stringify(value));
  },
  getObject(key) {
      var value = localStorage.getItem(this.domainKey(key));
      return value && JSON.parse(value);
  }
}

var timerType = "countdown";
var timerAlarmSound = new Audio('sounds/alarm_digital.mp3');

var $timerContainer = $('#timerContainer');
var $timerDisk = $('#timerDisk');
var $timerBarKnob = $('#timerBarKnob');
var $timerBarEnd = $('#timerBarEnd');
var $timerTime = $('#timerTime');
var $timerDirection = $('#timerDirection');
var $timerAlarmSelector = $('#timerAlarmSelector');

var timerLastDegree = 0;
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

// restore configuration from storage
setTimerType(STORAGE.getObject('type') || 'countdown');
setTimerAlarmSound(STORAGE.getObject('alarmSound') || 'digital');

function setTimerType(type){
  if (type !== timerType) {
    timerLastDegree = 360.0 - timerLastDegree;
  }
  
  timerType = type;
  
  var rotate = 0.0;
  var directionImage = 'graphics/countdown.svg';
  if(timerType == "countup") {
    rotate = 180.0;
    directionImage = 'graphics/countup.svg';    
  }

  $timerDirection.find('img').attr("src", directionImage);

  var animation_transform_rotateY = { 
    duration: 1500, 
    easing: 'easeOutBack',
    step: function(now, tween) {
      if (tween.prop === 'transform_rotateY') {
        $(this).css('transform','rotateY(' + now +'deg)' );
      }
    }
  };
  
  $timerContainer.animate({ transform_rotateY: rotate }, animation_transform_rotateY);
  $timerTime.animate({ transform_rotateY: rotate }, animation_transform_rotateY);
  
  startTimer();
}

function toggleTimerType(){
  if(timerType == "countdown") {
    setTimerType("countup")
  } else {
    setTimerType("countdown")
  }
}

function setTimerAlarmSound(sound){
  timerAlarmSound = new Audio(`sounds/alarm_${sound}.mp3`);
  STORAGE.setObject("alarmSound", sound);
}
global.setTimerAlarmSound = setTimerAlarmSound

function updateTimerBar(timer, state){
  timer.path.setAttribute('stroke', state.color);
  
  var containerRadius = $timerDisk.outerWidth() / 2.0;
  var rotation = timer.value() * 360.0;
  var position = {
    x: - Math.sin(rotation * Math.PI / 180.0) * containerRadius + containerRadius,
    y: - Math.cos(rotation * Math.PI / 180.0) * containerRadius - containerRadius
  };
  $timerBarEnd.css({ 
    transformOrigin: 'top',
    transform: 'translate(' + (position.x - $timerBarEnd.width() / 2.0) + 'px,' + position.y + 'px)' + ' rotate(' + -rotation + 'deg)'
  });
  $timerBarKnob.css({ 
    transform: 'translate(' + (position.x - $timerBarKnob.width() / 2.0) + 'px,' + (position.y - $timerBarKnob.height() / 2.0) + 'px)' 
  });
}

function updateTimerTime(timer, state){
  var valueSeconds = Math.round(timer.value() * DURATION_IN_SECONDS);
  if(valueSeconds != timer.valueSeconds){
    $timerTime.text(seconds2Date(valueSeconds).toISOString().substr(14, 5));
    timer.valueSeconds = valueSeconds;
  }
}

function startTimer(){
  var finishValue = timerType == "countdown" ? 0.0 : 1.0;
  var valueDiff = Math.abs(finishValue - timer.value());
  var duration = DURATION_IN_SECONDS * 1000 * valueDiff;
  if(duration > 0) {
    timer.animate(finishValue, { duration });
    clearTimeout(timer.timeout);
    timer.timeout = setTimeout(function(){
      timerAlarmSound.play();
    }, duration);
  }
}

function stopTimer(){
  clearTimeout(timer.timeout);
  timer.stop();
}

function setTimer(deg){
  var startValue = timerType == "countdown" ? 0.0 : 1.0;
  var newValue = Math.abs(startValue - (deg / 360.0));
  timer.set(newValue);
}

function seconds2Date(seconds){
  var date = new Date(null);
  date.setSeconds(seconds);
  return date;
}

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
      var targetDeg = atan / (Math.PI / 180.0) + 180.0;

      if (timerLastDegree < 90.0 && targetDeg > 270.0 ){
        targetDeg = 0.0;
      } else if (timerLastDegree > 270.0 && targetDeg < 90.0 ){
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

$timerDirection.bind('click tap', toggleTimerType);

// Initial Time
var urlParams = new URLSearchParams(window.location.search);
var initialTimerSeconds = parseInt(urlParams.get('init')) || (10 * 60)
var initialTimerDeg = initialTimerSeconds / DURATION_IN_SECONDS * 360
initialTimerDeg = Math.max(initialTimerDeg, 0); 
initialTimerDeg = Math.min(initialTimerDeg, 360);
timer.animate(initialTimerDeg/360, function() {
  setTimer(initialTimerDeg);
  startTimer();
});
