(function () {
  var startScreen = document.getElementById('startScreen');
  var videoIntro = document.getElementById('videoIntro');
  var introVideo = document.getElementById('introVideo');
  var introAudio = document.getElementById('introAudio');
  var invitation = document.getElementById('invitation');
  var soundBtn = document.getElementById('soundBtn');
  var countdownSection = document.getElementById('countdownSection');
  var nisanlandikSection = document.getElementById('nisanlandikSection');
  var countdownDays = document.getElementById('countdownDays');
  var countdownHours = document.getElementById('countdownHours');
  var countdownMins = document.getElementById('countdownMins');
  var countdownSecs = document.getElementById('countdownSecs');

  var INTRO_DURATION_MS = 3000;

  /* Sayfa açıldıktan sonra videoyu arka planda yükle; ilk çizim donmasın */
  function preloadIntroVideo() {
    if (!introVideo) return;
    introVideo.preload = 'auto';
    introVideo.load();
  }
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(preloadIntroVideo, { timeout: 2000 });
  } else {
    setTimeout(preloadIntroVideo, 500);
  }
  var ENGAGEMENT_DATE = new Date(2026, 3, 19, 19, 0, 0);
  var DAY_AFTER = new Date(2026, 3, 20, 0, 0, 0);

  function isPastEngagementDay() {
    return Date.now() >= DAY_AFTER.getTime();
  }

  function updateCountdown() {
    var now = Date.now();
    var end = ENGAGEMENT_DATE.getTime();
    if (now >= end) {
      var diff = Math.max(0, DAY_AFTER.getTime() - now);
      if (diff <= 0) {
        switchToNisanlandik();
        return;
      }
    } else {
      var diff = Math.max(0, end - now);
    }
    var sec = Math.floor((diff / 1000) % 60);
    var min = Math.floor((diff / 60000) % 60);
    var hour = Math.floor((diff / 3600000) % 24);
    var day = Math.floor(diff / 86400000);
    countdownDays.textContent = day;
    countdownHours.textContent = String(hour).padStart(2, '0');
    countdownMins.textContent = String(min).padStart(2, '0');
    countdownSecs.textContent = String(sec).padStart(2, '0');
  }

  function switchToNisanlandik() {
    countdownSection.classList.add('hidden');
    nisanlandikSection.classList.add('visible');
    if (window.countdownTimer) clearInterval(window.countdownTimer);
  }

  function initCountdown() {
    if (isPastEngagementDay()) {
      switchToNisanlandik();
      return;
    }
    countdownSection.classList.remove('hidden');
    nisanlandikSection.classList.remove('visible');
    updateCountdown();
    window.countdownTimer = setInterval(function () {
      if (isPastEngagementDay()) {
        switchToNisanlandik();
        return;
      }
      updateCountdown();
    }, 1000);
  }

  function onStart() {
    startScreen.classList.add('hidden');
    videoIntro.classList.remove('fade-out');
    introVideo.currentTime = 0;
    introVideo.muted = true;
    introVideo.play().catch(function () {});
    invitation.classList.remove('visible');
    introAudio.currentTime = 0;
    introAudio.muted = false;
    introAudio.play().catch(function () {});
    soundBtn.classList.remove('muted');

    setTimeout(function () {
      videoIntro.classList.add('fade-out');
      setTimeout(function () {
        invitation.classList.add('visible');
        initCountdown();
      }, 400);
    }, INTRO_DURATION_MS);
  }

  soundBtn.addEventListener('click', function () {
    introAudio.muted = !introAudio.muted;
    soundBtn.classList.toggle('muted', introAudio.muted);
    soundBtn.setAttribute('aria-label', introAudio.muted ? 'Müziği aç' : 'Müziği kapat');
  });

  function handleStart(e) {
    if (e.type === 'click' || (e.type === 'keydown' && (e.key === 'Enter' || e.key === ' '))) {
      e.preventDefault();
      onStart();
    }
  }

  startScreen.addEventListener('click', handleStart);
  startScreen.addEventListener('keydown', handleStart);

  /* Takvime ekle – iOS / Android / masaüstü uyumlu (.ics) */
  var addToCalendar = document.getElementById('addToCalendar');
  if (addToCalendar) {
    addToCalendar.addEventListener('click', function (e) {
      e.preventDefault();
      var summary = 'Nisan - Derya & Mustafa';
      var location = 'Ever After WorldPoint Kongre ve Etkinlik Merkezi, Büyükçekmece, İstanbul';
      var desc = 'Nisan davetiyesi';
      var ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Nisan Davetiyesi//TR',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        'UID:nisan-derya-mustafa-2026@davetiyemnerde',
        'DTSTAMP:20260101T120000Z',
        'DTSTART:20260419T160000Z',
        'DTEND:20260419T200000Z',
        'SUMMARY:' + summary,
        'LOCATION:' + location,
        'DESCRIPTION:' + desc,
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'Nisan_19_2026.ics';
      a.setAttribute('aria-hidden', 'true');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    });
  }
})();
