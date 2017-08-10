import $ from 'jquery';

export default class WebRTCServer {

    constructor(server) {
        this.url = "/api/v1/peerconnection";
        if (server) {
            this.url = server + "/api/v1/peerconnection";
        }

        this.cb =  {};
        var scope = this;
        $(window).on('beforeunload', function() {
            scope.deletePC(scope.pcid);
        });

        // create connection to the server
        this.createPC();
        this.startTimer();
    }

    createPC(data) {
        var scope = this;
        return $.ajax({
            url: this.url,
            method: 'POST',
            data: JSON.stringify(data),
            dataType: 'json',
            success: function(pcinfo) {
                scope.initPC(pcinfo);
            }
        });
    }

    initPC(pcinfo) {
        var scope = this;
        scope.pcid = pcinfo['id'];
        $('#pcid').text(scope.pcid);
        var STUN = {
            urls: [
                "stun:stun.l.google.com:19302",
                "stun:stun1.l.google.com:19302",
                "stun:stun2.l.google.com:19302",
                "stun:stun3.l.google.com:19302",
                "stun:stun4.l.google.com:19302",
                "stun:stun.ekiga.net",
                "stun:stun.ideasip.com",
                "stun:stun.rixtelecom.se",
                "stun:stun.schlund.de",
                "stun:stun.stunprotocol.org:3478",
                "stun:stun.voiparound.com",
                "stun:stun.voipbuster.com",
                "stun:stun.voipstunt.com",
                "stun:stun.voxgratia.org"
                //'turn:hypermeeting.paldeploy.com:3478?transport=udp'
            ]
        };

        var iceServers = {
            iceServers: [STUN]
        };

        var video = document.createElement('video');
        //var video = document.getElementById('video');
        this.video = video;
        video.addEventListener('loadeddata', function() {
            scope.dispatch('ready', video);
        });

        video.autoplay = true;
        video.oncanplay = function() {
            video.play();
        }
        var pc = new RTCPeerConnection(iceServers, null);
        this.pc = pc;

        pc.onaddstream = function(event) {
            if (video.srcObject) {
                video.mozSrcObject = event.stream;
            } else {
                video.src = URL.createObjectURL(event.stream);
            }
        };

        pc.onicecandidate = function(event) {
            var candidate = event.candidate;
            //pc.addIceCandidate(candidate);

            if (candidate) {
                console.log('candidate: ' + JSON.stringify(candidate, null, 2));
                scope.updatePC(scope.pcid, {
                    iceCandidate: candidate
                }).done(function(data) {
                    if (data && data.iceCandidates) {
                        $(data.iceCandidates).each(function (i, candidate) {
                            pc.addIceCandidate(new RTCIceCandidate(candidate));
                        });
                    }
                });
            }
        };

        pc.onconnectionstatechange = function(event) {

        };

        pc.createOffer({
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1
        }).then(
            function(offerSDP) {
                pc.setLocalDescription(offerSDP, function() {
                    console.log('setLocalDescription() success ' + JSON.stringify(offerSDP, null, 2));

                    scope.updatePC(scope.pcid, {
                        offer: offerSDP
                    }).done(function(data) {
                        pc.setRemoteDescription(data.answer);
                    });

                }, function() {
                    console.log('setLocalDescription() failure')
                });

            },
            function (e) {
                console.error(e);
            }
        );
    }

    updatePC(id, data) {
        return $.ajax({
            url: this.url + '/' + id,
            method: 'PUT',
            data: JSON.stringify(data),
            contentType: 'application/json',
            dataType: 'json'
        });
    }

    deletePC(id) {
        return $.ajax({
            url: this.url + '/' + id,
            method: 'DELETE'
        });
    }

    getPC(id) {
        return $.ajax({
            url: this.url + '/' + id,
            method: 'GET',
            dataType: 'json'
        });
    }

    on(name, cb) {
        var callbacks = this.cb[name];
        if (!callbacks) {
            callbacks = []
            this.cb[name] = callbacks;
        }
        callbacks.push(cb);
    }

    off(name, cb) {
        var callbacks = this.cb[name];
        if (callbacks) {
            callbacks.filter(function(i) {
                return i != cb
            });
        }
    }

    dispatch(name) {
        var callbacks = this.cb[name];
        var args = [];

        for (var i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
        }

        if (callbacks) {
            callbacks.map(function(cb) {
                cb.apply(this, args);
            });
        }
    }

    startTimer() {
        var iceTimerCount = 0;
        var scope = this;
        var iceTimer = setInterval(function() {
            if (scope.pcid) {
                scope.getPC(scope.pcid).done(function(data) {
                    if (data && data.iceCandidates) {
                        clearInterval(iceTimer);
                        $(data.iceCandidates).each(function (i, candidate) {
                            console.log('candidate from server: ' + JSON.stringify(candidate, null, 2));
                            pc.addIceCandidate(new RTCIceCandidate(candidate));
                        });
                    }
                });
            }
            iceTimerCount++;
            if (iceTimerCount == 10) {
                clearInterval(iceTimer);
            }
        }, 1000);
    }
}
