const bodyTest = document.querySelector('#startStopBtn');
const test = document.querySelector('#test');

bodyTest.addEventListener('click', () => {
    test.classList.toggle('hidden') == true
        ? test.classList.remove('hidden')
        : test.classList.remove('hidden');
    setTimeout(() => (bodyTest.style.animation = 1));
});

function I(i) {
    return document.getElementById(i);
}

var s = new Speedtest();
s.setParameter('telemetry_level', 'basic');

var meterBk = /Trident.*rv:(\d+\.\d+)/i.test(navigator.userAgent)
    ? '#1d1929'
    : '#1d1929';

var dlColor = '#1d1929',
    ulColor = '#1d1929';

var progColor = '#bdff00';

function drawMeter(c, amount, bk, fg, progress, prog) {
    var ctx = c.getContext('2d');
    var dp = window.devicePixelRatio || 100;
    var cw = c.clientWidth * dp,
        ch = c.clientHeight * dp;
    var sizScale = ch * 0.0055;
    if (c.width == cw && c.height == ch) {
        ctx.clearRect(0, 0, cw, ch);
    } else {
        c.width = cw;
        c.height = ch;
    }
    ctx.beginPath();
    ctx.strokeStyle = bk;
    ctx.lineWidth = 20 * sizScale;
    ctx.arc(
        c.width / 2,
        c.height - 58 * sizScale,
        c.height / 1.8 - ctx.lineWidth,
        -Math.PI * 1.1,
        Math.PI * 0.1
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = fg;
    ctx.lineWidth = 20 * sizScale;
    ctx.arc(
        c.width / 2,
        c.height - 58 * sizScale,
        c.height / 1.8 - ctx.lineWidth,
        -Math.PI * 1.1,
        amount * Math.PI * 1.2 - Math.PI * 1.1
    );
    ctx.stroke();
    if (typeof progress !== 'undefined') {
        ctx.fillStyle = prog;
        ctx.fillRect(
            c.width * 0.3,
            c.height - 16 * sizScale,
            c.width * 0.4 * progress,
            40 * sizScale
        );
    }
}
function mbpsToAmount(s) {
    return 1 - 1 / Math.pow(1.3, Math.sqrt(s));
}
function format(d) {
    d = Number(d);
    if (d < 10) return d.toFixed(2);
    if (d < 100) return d.toFixed(1);
    return d.toFixed(0);
}

var uiData = null;
function startStop() {
    if (s.getState() == 3) {
        s.abort();
        data = null;
        I('startStopBtn').className = '';
        initUI();
    } else {
        I('startStopBtn').className = 'running';
        I('shareArea').style.display = 'none';
        s.onupdate = function (data) {
            uiData = data;
        };
        s.onend = function (aborted) {
            I('startStopBtn').className = '';
            updateUI(true);
            if (!aborted) {
                try {
                    var testId = uiData.testId;
                    if (testId != null) {
                        var shareURL =
                            window.location.href.substring(
                                0,
                                window.location.href.lastIndexOf('/')
                            ) +
                            '/results/?id=' +
                            testId;
                        I('resultsImg').src = shareURL;
                        I('resultsURL').value = shareURL;
                        I('testId').innerHTML = testId;
                        I('shareArea').style.display = '';
                    }
                } catch (e) {}
            }
        };
        s.start();
    }
}

function updateUI(forced) {
    if (!forced && s.getState() != 3) return;
    if (uiData == null) return;
    var status = uiData.testState;
    I('ip').textContent = uiData.clientIp;
    I('dlText').textContent =
        status == 1 && uiData.dlStatus == 0 ? '...' : format(uiData.dlStatus);
    drawMeter(
        I('dlMeter'),
        mbpsToAmount(Number(uiData.dlStatus * (status == 1 ? oscillate() : 1))),
        meterBk,
        dlColor,
        Number(uiData.dlProgress),
        progColor
    );
    I('ulText').textContent =
        status == 3 && uiData.ulStatus == 0 ? '...' : format(uiData.ulStatus);
    drawMeter(
        I('ulMeter'),
        mbpsToAmount(Number(uiData.ulStatus * (status == 3 ? oscillate() : 1))),
        meterBk,
        ulColor,
        Number(uiData.ulProgress),
        progColor
    );
    I('pingText').textContent = format(uiData.pingStatus);
    I('jitText').textContent = format(uiData.jitterStatus);
}
function oscillate() {
    return 1 + 0.02 * Math.sin(Date.now() / 100);
}

window.requestAnimationFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback, element) {
        setTimeout(callback, 1000 / 60);
    };
function frame() {
    requestAnimationFrame(frame);
    updateUI();
}
frame();

function initUI() {
    drawMeter(I('dlMeter'), 0, meterBk, dlColor, 0);
    drawMeter(I('ulMeter'), 0, meterBk, ulColor, 0);
    I('dlText').textContent = '';
    I('ulText').textContent = '';
    I('pingText').textContent = '';
    I('jitText').textContent = '';
    I('ip').textContent = '';
}

const selectedButton = document.querySelector('button');
const modalOpen = document.querySelector('.modal-wrapper');
const modalMessage = document.querySelector('.modal .title span');
const modalClose = document.querySelector('.modal button.close');

selectedButton.addEventListener('click', () => {
    modalOpen.classList.add('open');
});

modalClose.addEventListener('click', () => {
    modalOpen.classList.remove('open');
});

window.addEventListener('keydown', closePressButtonEsc);

function closePressButtonEsc(event) {
    if (event.key === 'Escape') {
        modalOpen.close();
    }
}
