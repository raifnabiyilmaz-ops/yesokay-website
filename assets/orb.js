// yesokay. küre demosu. Çerez yok, hiçbir depolama yok, ağ isteği yok, izleme yok.
// Bu bir TAT: üç örnek mesaj, dördüncü basışta durur. Gerçek günlük kural olarak ASLA sunulmaz.
// Ses: isteğe bağlı, varsayılan KAPALI, asla kendiliğinden çalmaz. Ses dosyaları SADECE ziyaretçi sesi açınca istenir
// (sesleriYukle yalnızca ses anahtarının tıklamasından çağrılır; sayfa HTML'inde <audio> / <source> / ön yükleme yok).
(function (kok, fabrika) {
  var api = fabrika();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    kok.YesokayOrb = api;
    if (kok.document && kok.document.getElementById) api.baslat(kok.document, kok);
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Saf mantık (node testi bunu doğrudan çağırır): 1.–3. basış örnekler sırayla, 4. basış kapanış, sonrası dinlenme.
  function demoOlustur(ornekler, kapanis) {
    var n = 0;
    return {
      bas: function () {
        n += 1;
        if (n <= ornekler.length) return { tur: 'ornek', sira: n, metin: ornekler[n - 1] };
        if (n === ornekler.length + 1) return { tur: 'kapanis', metin: kapanis };
        return { tur: 'dinlen' };
      },
    };
  }

  var MESAJ_GECIKME = 180; // ms: dokunuş sesinden sonra mesaj sesi (uygulamadaki sıra)

  function baslat(doc, win) {
    var btn = doc.getElementById('orb-btn');
    var mesaj = doc.getElementById('orb-mesaj');
    var ipucu = doc.getElementById('orb-ipucu');
    var sesBtn = doc.getElementById('orb-ses');
    var deneBtn = doc.getElementById('orb-dene');
    var sahne = doc.getElementById('orb-sahne');
    var veriEl = doc.getElementById('orb-veri');
    if (!btn || !mesaj || !veriEl) return null;
    var veri = JSON.parse(veriEl.textContent);
    var demo = demoOlustur(veri.ornekler, veri.kapanis);

    var sesAcik = false;
    var sesler = null; // ziyaretçi sesi açana kadar null: hiç ses nesnesi, hiç istek yok
    var basladi = false; // pointerdown bu basışı zaten başlattı mı (klavyede yok)

    function sesleriYukle() {
      if (sesler) return;
      sesler = {};
      for (var ad in veri.ses) {
        if (Object.prototype.hasOwnProperty.call(veri.ses, ad)) {
          var a = new win.Audio(veri.ses[ad]);
          a.preload = 'auto';
          sesler[ad] = a;
        }
      }
    }
    function sesCal(ad) {
      if (!sesAcik || !sesler || !sesler[ad]) return;
      try {
        sesler[ad].currentTime = 0;
        var p = sesler[ad].play();
        if (p && p.catch) p.catch(function () {}); // tarayıcı engellerse sessiz kal (sessiz davranışına uy)
      } catch (e) { /* ses yok, demo çalışır */ }
    }

    function goster(metin) {
      mesaj.classList.remove('gorun');
      mesaj.textContent = metin; // aria-live="polite": ekran okuyucu duyurur
      void mesaj.offsetWidth; // yumuşak belirme yeniden başlasın
      mesaj.classList.add('gorun');
    }
    function bastir(ms) {
      btn.classList.add('basili');
      win.setTimeout(function () { btn.classList.remove('basili'); }, ms);
    }

    // Parmak değdiği AN: sıkışma (sadece CSS dönüşümü) + (ses açıksa) dokunuş sesi
    btn.addEventListener('pointerdown', function () {
      basladi = true;
      btn.classList.add('basili');
      sesCal('dokunus');
    });
    function birak() { btn.classList.remove('basili'); }
    btn.addEventListener('pointerup', birak);
    btn.addEventListener('pointercancel', birak);
    btn.addEventListener('pointerleave', birak);

    // click: fare, dokunma, Enter ve Boşluk (klavye) hepsi buradan geçer
    btn.addEventListener('click', function () {
      if (!basladi) { bastir(160); sesCal('dokunus'); } // klavye: pointerdown yok
      basladi = false;
      var r = demo.bas();
      if (r.tur === 'dinlen') return;
      if (ipucu) ipucu.classList.add('silik');
      goster(r.metin);
      win.setTimeout(function () { sesCal(r.tur === 'kapanis' ? 'kapanis' : 'mesaj'); }, MESAJ_GECIKME);
      if (r.tur === 'kapanis' && sahne) sahne.classList.add('dinleniyor');
    });

    if (sesBtn) {
      sesBtn.addEventListener('click', function () {
        sesAcik = !sesAcik;
        if (sesAcik) sesleriYukle(); // dosyalar İLK KEZ burada istenir
        sesBtn.setAttribute('aria-checked', sesAcik ? 'true' : 'false');
        sesBtn.textContent = sesAcik ? veri.sesAcik : veri.sesKapali;
      });
    }
    if (deneBtn) {
      deneBtn.addEventListener('click', function () { btn.focus(); });
    }
    return { demo: demo };
  }

  return { demoOlustur: demoOlustur, baslat: baslat };
});
