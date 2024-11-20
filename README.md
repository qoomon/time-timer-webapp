# time-timer-webapp [![starline](https://starlines.qoo.monster/assets/qoomon/time-timer-webapp)](https://github.com/qoomon/starlines)

[![Build & Deploy](https://github.com/qoomon/time-timer-webapp/workflows/Build%20&%20Deploy/badge.svg)](https://github.com/qoomon/time-timer-webapp/actions)

### [Demo](https://qoomon.github.io/time-timer-webapp?init=600)

### Screenshot
[![screenshot](docs/Screenshot.png)](https://qoomon.github.io/time-timer-webapp?init=600)

### Docker Instructions
```shel
# initial setup
docker build -t qoomon/time-timer-webapp https://github.com/qoomon/time-timer-webapp.git
# start the service
docker run --rm -p 8080:80 qoomon/time-timer-webapp
# open the app in your browser
xdg-open "http://localhost:8080"
```
