(function () {
    'use strict';
    
    var video
      , characters = "()[]/\\XS$_Z-0~#@|><+%&".split("")
      , ctx1
      , ctx2
      , offScreenCanvas
      , offScreenCtx
      , colorFunc = getColor
      , videoCanvas
      , brightness
      , showFps
      , charWidth = 10
      , charHeight = 7;

    navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    window.onload = function () {
        video = document.createElement('video');
        videoCanvas = document.createElement('canvas');
        videoCanvas.width = 80;
        videoCanvas.height = 60;
        ctx1 = videoCanvas.getContext('2d');
        ctx2 = document.getElementById('c2').getContext('2d');
        ctx2.fillStyle = "#000";

        offScreenCanvas = document.createElement('canvas');
        offScreenCanvas.width = 800; // 840
        offScreenCanvas.height = 420; // 442
        offScreenCtx = offScreenCanvas.getContext('2d');
        offScreenCtx.font = "bold 12px Verdana";
        offScreenCtx.textBaseline = "top";
        
        var selectColorScale = document.getElementById('color');
        selectColorScale.addEventListener('change', function (evt) {
            var opt = selectColorScale.options[selectColorScale.selectedIndex].value;
            switch (opt) {
                case 'True':
                    colorFunc = getColor;
                    break;
                case 'Green':
                    colorFunc = getColorAsGreenScale;
                    break;
                case 'Gray':
                    colorFunc = getColorAsGrayScale;
                    break;
                case 'BlackAndWhite':
                    colorFunc = whiteColor;
                    break;
                default:
                    return;
            }
        }, false);
        
        var selectPerformance = document.getElementById('performance');
        selectPerformance.addEventListener('change', function (evt) {
            var opt = selectPerformance.options[selectPerformance.selectedIndex].value;
            if (opt === 'Details') {
                offScreenCtx.font = "bold 8px Verdana";
                charWidth = 7;
                charHeight = 5;
                videoCanvas.width = 120;
                videoCanvas.height = 90;
            } else {
                offScreenCtx.font = "bold 12px Verdana";
                charWidth = 10;
                charHeight = 7;
                videoCanvas.width = 80;
                videoCanvas.height = 60;
            }
        }, false);

        video.addEventListener('play', function() {
            timerCallback();
        }, false);

        document.getElementById('btn-play').addEventListener('click', function () {
            if (!video.src) video.src = "/defragUndead";
            video.play();
        }, false);

        document.getElementById('btn-pause').addEventListener('click', function () {
            video.pause();
        }, false);

        document.getElementById('btn-camera-record').addEventListener('click', function () {
            navigator.getUserMedia({ 
                'audio': false, 
                'video': true 
            }, function(stream) {
                video.stream = stream;
                if (window.URL) {
                    video.src = window.URL.createObjectURL(stream);
                } else {
                    video.src = stream;
                }
                video.play();
            }, function(error) {
                console.log(error);
            });
        }, false);

        document.getElementById('btn-take-photo').addEventListener('click', function () {
            var dataUrl = c2.toDataURL();
            var downloadLink = document.createElement('a');
            downloadLink.setAttribute('id', 'downloadLink');
            downloadLink.setAttribute('href', dataUrl);
            downloadLink.setAttribute('download', "myImage.png");
            
            var img = document.createElement('img');
            img.className = 'pic';
            img.src = dataUrl;
            img.width = 120;
            img.height = 63;
            downloadLink.appendChild(img);
            
            document.getElementById('pictures').appendChild(downloadLink);
        }, false);
        
        document.getElementById('btn-play-remote-video').addEventListener('click', function() {
            var encodedSrc = encodeURIComponent(document.getElementById('txt-src').value);
            video.src = "/streamfile/" + encodedSrc;
            video.play();
        }, false);
        
        showFps = document.getElementById('show-fps');
    };

    function timerCallback() {
        if (video.paused || video.ended) return;
        
        var start = new Date();
        render();
        var end = new Date() - start;
        showFps.innerHTML = (1000 / end).toFixed(2);
        
        setTimeout(function () {
            timerCallback();
        }, 0);
    }

    function render() {
        var colorsSum
          , character
          , avg
          , imageData
          , offset
          , color
          , x, y;
          
        ctx1.drawImage(video, 0, 0, videoCanvas.width, videoCanvas.height);
        imageData = ctx1.getImageData(0, 0, videoCanvas.width, videoCanvas.height);
        
        offScreenCtx.clearRect(0, 0, offScreenCanvas.width, offScreenCanvas.height);
        
        for (y = 0; y < videoCanvas.height; y += 2) {
            for (x = 0; x < videoCanvas.width; x++) {
                offset = (y * videoCanvas.width + x) * 4;
                
                color = getColorAtOffset(imageData.data, offset);
                colorsSum = color.red + color.green + color.blue;
                avg = Math.round(colorsSum / 3);
                
                character = getCharacter(getBrightness(color.red, color.green, color.blue));
                
                offScreenCtx.fillStyle = colorFunc(color.red, color.green, color.blue, avg);
                offScreenCtx.fillText(character, x * charWidth, y * charHeight); // 7 5
            }
        }
        ctx2.fillRect(0, 0, 800, 420);
        ctx2.drawImage(offScreenCanvas, 0, 0);
    }

    function getBrightness(r, g, b) {
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    }

    function getCharacter(brightness) {
        return characters[(characters.length - 1) - Math.round(brightness * (characters.length - 1))];
    }

    function getColorAsGreenScale(r, g, b, avg) {
        return getColor(avg, avg << 1, avg);
    }

    function getColorAsGrayScale(r, g, b, avg) {
        return getColor(avg, avg, avg);
    }

    function getColor(r, g, b, avg) {
        return "rgb(" + r.toFixed(0) + ", " + g.toFixed(0) + ", " + b.toFixed(0) + ")";
    }

    function whiteColor(r, g, b) {
        return "#FFF";
    }

    function getColorAtOffset(data, offset) {
        return {
            red: data[offset],
            green: data[offset + 1],
            blue: data[offset + 2]
        };
    }
}());