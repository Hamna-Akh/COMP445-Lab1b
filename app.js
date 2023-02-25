let player = dashjs.MediaPlayer().create();
var url = "https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd";

player.initialize(document.querySelector("#videoPlayer"), url, true);
player.on(dashjs.MediaPlayer.events["PLAYBACK_ENDED"], function () {
  clearInterval(eventPoller);
  clearInterval(bitrateCalculator);
});

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


    // function disableABR(){
    //     player.updateSettings({
    //         streaming: {
    //             abr: {
    //                 useDefaultABRRules: false,
    //                 additionalAbrRules: {
    //                     insufficientBufferRule: true,
    //                     switchHistoryRule: false,
    //                     droppedFramesRule: false,
    //                     abandonRequestsRule: false
    //                 }
    //             }
    //         }
    //     });
    //     relaunchPlayer();
    // }

    // function enableABR(){
    //     player.updateSettings({
    //         streaming: {
    //             abr: {
    //                 useDefaultABRRules: true,
    //                 additionalAbrRules: {
    //                     insufficientBufferRule: true,
    //                     switchHistoryRule: false,
    //                     droppedFramesRule: false,
    //                     abandonRequestsRule: false
    //                 }
    //             }
    //         }
    //     });
    //     relaunchPlayer();
    // }

    // function enableDynamicABR(){
    //     player.updateSettings({
    //         streaming: {
    //             abr: {
    //                 useDefaultABRRules: true,
    //                 ABRStrategy: 'abrDynamic',
    //                 additionalAbrRules: {
    //                     insufficientBufferRule: true,
    //                     switchHistoryRule: false,
    //                     droppedFramesRule: false,
    //                     abandonRequestsRule: false
    //                 }
    //             }
    //         }
    //     });
    //     relaunchPlayer();
    // }

    // function enableBOLATABR(){
    //     player.updateSettings({
    //         streaming: {
    //             abr: {
    //                 useDefaultABRRules: true,
    //                 ABRStrategy: 'bola',
    //                 additionalAbrRules: {
    //                     insufficientBufferRule: true,
    //                     switchHistoryRule: false,
    //                     droppedFramesRule: false,
    //                     abandonRequestsRule: false
    //                 }
    //             }
    //         }
    //     });
    //     relaunchPlayer();
    // }

    // function enableThroughputABR(){
    //     player.updateSettings({
    //         streaming: {
    //             abr: {
    //                 useDefaultABRRules: true,
    //                 ABRStrategy: 'throughput',
    //                 additionalAbrRules: {
    //                     insufficientBufferRule: true,
    //                     switchHistoryRule: false,
    //                     droppedFramesRule: false,
    //                     abandonRequestsRule: false
    //                 }
    //             }
    //         }
    //     });
    //     relaunchPlayer();
    // }



        function disableABR() {
            player.updateSettings({'streaming': {'abr': {'useDefaultABRRules': false }}});
            relaunchPlayer();
        }

        function enableABR() {
            player.updateSettings({'streaming': {'abr': {'useDefaultABRRules': true }}});
            relaunchPlayer();
        }

        function enableDynamicABR() {
            player.updateSettings({'streaming': {'abr': {'ABRStrategy': 'abrDynamic' }}});
            relaunchPlayer();
        }

        function enableBOLATABR() {
            player.updateSettings({'streaming': {'abr': {'ABRStrategy': 'bola' }}});
            relaunchPlayer();
        }

        function enableThroughputABR() {
            player.updateSettings({'streaming': {'abr': {'ABRStrategy': 'throughput'}}});
            relaunchPlayer();
        }

    function relaunchPlayer() {
        player.reset();
        player.initialize(document.querySelector("#videoPlayer"), url, true);
        player.on(dashjs.MediaPlayer.events["PLAYBACK_ENDED"], function () {
                clearInterval(eventPoller);
                clearInterval(bitrateCalculator);
        });
    }


var eventPoller = setInterval(function () {
  var streamInfo = player.getActiveStream().getStreamInfo();
  var dashMetrics = player.getDashMetrics();
  var dashAdapter = player.getDashAdapter();

  if (dashMetrics && streamInfo) {
      const periodIdx = streamInfo.index;
      var repSwitch = dashMetrics.getCurrentRepresentationSwitch('video', true);
      var bufferLevel = dashMetrics.getCurrentBufferLevel('video', true);
      var bitrate = repSwitch ? Math.round(dashAdapter.getBandwidthForRepresentation(repSwitch.to, periodIdx) / 1000) : NaN;
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
      document.getElementById('reportedBitrate').innerText = "Bitrate: " + (bitrate/1000).toFixed(2) + " Mbps";
      document.getElementById('throughput').innerText = "Throughput: " + (throughput/1000000).toFixed(2) + " Mbps";
      document.getElementById('segmentTime').innerText = "Segment Time: " + (segmentDownloadTime).toFixed(2) + " seconds";
      document.getElementById('segmentSize').innerText = "Segment Size: " + (segmentSize).toFixed(2) + " Bytes";

      console.log("ABR strategy: " + player.getSettings().streaming.abr.ABRStrategy);
      console.log("buffer level: " + bufferLevel + " seconds")
      console.log("bitrate: " + (bitrate/1000).toFixed(2) + " Mbps")
      console.log("throughput: " + (throughput/1000000).toFixed(2) + " Mbps")
      console.log("Segment Time: " + (segmentDownloadTime).toFixed(2) + " seconds")
      console.log("Segment Size: " + (segmentSize).toFixed(2) + " Bytes")
      console.log(" ")
  }
} , 8000);