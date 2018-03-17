# nasa suits

Simulates http server for telemery data. Data points sweep from min to max values +/- 10%. Switch data points change state according to data stream levels. The data rate for the telemetry is 10 Hertz, the data rate for the swtich stream is 1 Hertz. Two endpoints stream json data:
- http://telemetry-sim-telemetry-sim.a3c1.starter-us-west-1.openshiftapps.com/api/telemetry/recent
- http://telemetry-sim-telemetry-sim.a3c1.starter-us-west-1.openshiftapps.com/api/switch/recent

To run the data stream simulation:
- install nodejs and npm > https://nodejs.org/
- `git clone https://github.com/audiblePi/nasa_suits.git`
- `cd nasa_suits`
- `npm install`
- `node server.js`
- navigate to the endpoints in a browser to view the data stream
