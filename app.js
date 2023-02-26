//Authors: @Hamna Akther and @Antonio Reda
//Purpose: Create a DASH.js video player while allowing the switch of different types of ABR as well as recording and displaying the metrics.


//Creates a DASH.js video player.
let player = dashjs.MediaPlayer().create();
//provides an mpd for the video player.
var url = "https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd";
//initializes the video player and clears out unwanted noise from the metrics.
player.initialize(document.querySelector("#videoPlayer"), url, true);
player.on(dashjs.MediaPlayer.events["PLAYBACK_ENDED"], function () {
  clearInterval(eventPoller);
  clearInterval(bitrateCalculator);
});

//List of ABR types (Dynamic, BOLA, Throughput).
    function enableDynamicABR(){
        player.updateSettings({
            streaming: {
                abr: {
                    useDefaultABRRules: true,
                    ABRStrategy: 'abrDynamic',
                    additionalAbrRules: {
                        insufficientBufferRule: true,
                        switchHistoryRule: false,
                        droppedFramesRule: false,
                        abandonRequestsRule: false
                    }
                }
            }
        });
        //reloads the video player.
        player.initialize(document.querySelector("#videoPlayer"), url, true);
    }

    function enableBOLAABR(){
        player.updateSettings({
            streaming: {
                abr: {
                    useDefaultABRRules: true,
                    ABRStrategy: 'bola',
                    additionalAbrRules: {
                        insufficientBufferRule: true,
                        switchHistoryRule: false,
                        droppedFramesRule: false,
                        abandonRequestsRule: false
                    }
                }
            }
        });
        //reloads the video player.
        player.initialize(document.querySelector("#videoPlayer"), url, true);
    }

    function enableThroughputABR(){
        player.updateSettings({
            streaming: {
                abr: {
                    useDefaultABRRules: true,
                    ABRStrategy: 'throughput',
                    additionalAbrRules: {
                        insufficientBufferRule: true,
                        switchHistoryRule: false,
                        droppedFramesRule: false,
                        abandonRequestsRule: false
                    }
                }
            }
        });
        //reloads the video player.
        player.initialize(document.querySelector("#videoPlayer"), url, true);
    }

//This function displays each of the metrics every 8 seconds.
var eventPoller = setInterval(function () {
  var streamInfo = player.getActiveStream().getStreamInfo();
  var dashMetrics = player.getDashMetrics();
  var dashAdapter = player.getDashAdapter();
//Ensures the video player calculates and records metrics.
  if (dashMetrics && streamInfo) {
      const periodIdx = streamInfo.index;
      var repSwitch = dashMetrics.getCurrentRepresentationSwitch('video', true);
      //Retrieves the buffer level.
      var bufferLevel = dashMetrics.getCurrentBufferLevel('video', true);
      //Retrieves the bitrate.
      var bitrate = repSwitch ? Math.round(dashAdapter.getBandwidthForRepresentation(repSwitch.to, periodIdx)) : NaN;
      var adaptation = dashAdapter.getAdaptationForType(periodIdx, 'video', streamInfo);
      //Retrieves the throughput.
      var throughput = player.getAverageThroughput('video');
      var currentRep = adaptation.Representation_asArray.find(function (rep) {
          return rep.id === repSwitch.to
      })

      // Retrieve the Segment time
      var requestTime = dashMetrics.getCurrentHttpRequest('video', true).trequest;
      var responseTime = dashMetrics.getCurrentHttpRequest('video', true).tresponse;
      var segmentDownloadTime = responseTime - requestTime;

      // Retrieve the Segment size (in bytes)
      var segmentSize = (segmentDownloadTime * throughput)/8

      
      //Displays the metrics on the page.
      document.getElementById('bufferLevel').innerText = "Buffer level: " + bufferLevel + " Seconds";
      document.getElementById('reportedBitrate').innerText = "Bitrate: " + (bitrate/1000000).toFixed(5) + " Mbps";
      document.getElementById('throughput').innerText = "Throughput: " + (throughput/1000000).toFixed(5) + " Mbps";
      document.getElementById('segmentTime').innerText = "Segment Time: " + (segmentDownloadTime).toFixed(3) + " Seconds";
      document.getElementById('segmentSize').innerText = "Segment Size: " + (segmentSize).toFixed(5) + " Bytes";

      //Displays the metrics in the console.
      console.log("ABR strategy: " + player.getSettings().streaming.abr.ABRStrategy);
      console.log("buffer level: " + bufferLevel + " Seconds")
      console.log("bitrate: " + (bitrate/1000000).toFixed(5) + " Mbps")
      console.log("throughput: " + (throughput/1000000).toFixed(5) + " Mbps")
      console.log("Segment Time: " + (segmentDownloadTime).toFixed(3) + " Seconds")
      console.log("Segment Size: " + (segmentSize).toFixed(2) + " Bytes")
      console.log(" ")
  }
} , 8000);