# nasa suits

Simulates http server for telemery data. Data points sweep from min to max values +/- 10%. Switch data points change state according to data stream levels. The data rate for the telemtry is 10 Hertz, the data rate for the swtich stream is 1 Hertz. Two endpoints stream json data:
- http://localhost:3000/api/telemetry/recent
- http://localhost:3000/api/switch/recent

To run the data stream simulation:
- `git clone https://github.com/audiblePi/nasa_suits.git`
- `cd nasa_suits`
- `npm install`
- `node server.js`
- `navigate to the endpoints in a browser to view the data stream`
