let player = dashjs.MediaPlayer().create();
var url = "https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd";

player.initialize(document.querySelector("#videoPlayer"), url, true);
player.on(dashjs.MediaPlayer.events["PLAYBACK_ENDED"], function () {
  clearInterval(eventPoller);
  clearInterval(bitrateCalculator);
});

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
        
        player.initialize(document.querySelector("#videoPlayer"), url, true);
    }

    function enableBOLATABR(){
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
        
        player.initialize(document.querySelector("#videoPlayer"), url, true);
    }

var eventPoller = setInterval(function () {
  var streamInfo = player.getActiveStream().getStreamInfo();
  var dashMetrics = player.getDashMetrics();
  var dashAdapter = player.getDashAdapter();

  if (dashMetrics && streamInfo) {
      const periodIdx = streamInfo.index;
      var repSwitch = dashMetrics.getCurrentRepresentationSwitch('video', true);
      var bufferLevel = dashMetrics.getCurrentBufferLevel('video', true);
      var bitrate = repSwitch ? Math.round(dashAdapter.getBandwidthForRepresentation(repSwitch.to, periodIdx)) : NaN;
      var adaptation = dashAdapter.getAdaptationForType(periodIdx, 'video', streamInfo);
      var throughput = player.getAverageThroughput('video');
      var currentRep = adaptation.Representation_asArray.find(function (rep) {
          return rep.id === repSwitch.to
      })

      // Retrieve the segment time
      var requestTime = dashMetrics.getCurrentHttpRequest('video', true).trequest;
      var responseTime = dashMetrics.getCurrentHttpRequest('video', true).tresponse;
      var segmentDownloadTime = responseTime - requestTime;

      // Retrieve Segment size
      var segmentSize = (segmentDownloadTime * throughput)/8

      var frameRate = currentRep.frameRate;
      var resolution = currentRep.width + 'x' + currentRep.height;
      document.getElementById('bufferLevel').innerText = "Buffer level: " + bufferLevel + " seconds";
      document.getElementById('reportedBitrate').innerText = "Bitrate: " + (bitrate/1000000).toFixed(2) + " Mbps";
      document.getElementById('throughput').innerText = "Throughput: " + (throughput/1000000).toFixed(5) + " Mbps";
      document.getElementById('segmentTime').innerText = "Segment Time: " + (segmentDownloadTime).toFixed(2) + " seconds";
      document.getElementById('segmentSize').innerText = "Segment Size: " + (segmentSize).toFixed(2) + " Bytes";

      console.log("ABR strategy: " + player.getSettings().streaming.abr.ABRStrategy);
      console.log("buffer level: " + bufferLevel + " seconds")
      console.log("bitrate: " + (bitrate/1000000).toFixed(2) + " Mbps")
      console.log("throughput: " + (throughput/1000000).toFixed(5) + " Mbps")
      console.log("Segment Time: " + (segmentDownloadTime).toFixed(2) + " seconds")
      console.log("Segment Size: " + (segmentSize).toFixed(2) + " Bytes")
      console.log(" ")
  }
} , 8000);