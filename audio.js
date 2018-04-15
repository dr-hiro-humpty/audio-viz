const canvas = document.querySelector("#canvas");
const drawContext = canvas.getContext('2d');

var handleSuccess = function(stream) {
  var context = new AudioContext();
  var input = context.createMediaStreamSource(stream);
  var analyzer = context.createAnalyser();
  analyzer.fftSize = 1024;

  input.connect(analyzer);

  function draw() {
    // clear canvas
    drawContext.fillStyle = 'rgba(0, 0, 0, 1)';
    drawContext.fillRect(0, 0, canvas.width, canvas.height);

    // plot frequency bar
    const freqArray = new Uint8Array(analyzer.frequencyBinCount);
    analyzer.getByteFrequencyData(freqArray);
    var barWidth = canvas.width / analyzer.fftSize;
    var barHeight;
    var x = 0;

    for (let i = 0; i < analyzer.frequencyBinCount; ++i) {
      barHeight = freqArray[i];
      drawContext.fillStyle = 'rgb(' + (barHeight + 100) + ', 50, 50)';
      drawContext.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }

    // plot fft data
    const fftArray = new Uint8Array(analyzer.fftSize);
    analyzer.getByteTimeDomainData(fftArray);
    drawContext.lineWidth = 2;
    drawContext.strokeStyle = 'rgb(0, 255, 0)';
    drawContext.beginPath();
    var sliceWidth = canvas.width * 1.0 / analyzer.fftSize;

    x = 0;
    var value = fftArray[0] / 128.0;
    var y = value * canvas.height / 2;
    drawContext.moveTo(x, y);
    for (let i = 1; i < analyzer.fftSize; ++i) {
      value = fftArray[i] / 128.0;
      y = value * canvas.height / 2;
      drawContext.lineTo(x, y);
      x += sliceWidth;
    }
    drawContext.lineTo(canvas.width, canvas.height / 2);
    drawContext.stroke();

    // draw request
    requestAnimationFrame(draw);
  }

  draw();
}

navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    .then(handleSuccess);
