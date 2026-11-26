// yesokay. web sitesi. Çerez yok, analitik yok, dışarıya istek yok.
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  // Dar ekranda menü dil seçicinin ALTINDA görünür (site.css, aynı sorgu): klavye sırası da öyle olsun diye
  // dil seçici belgede menünün önüne taşınır. Görünüm değişmez. Geniş ekranda eski sıraya döner.
  var menu = document.querySelector('.ana-menu');
  var secici = document.querySelector('.ust .dil-sec');
  if (menu && secici) {
    var dar = window.matchMedia('(max-width: 720px)');
    var sirala = function () {
      var odak = document.activeElement;
      if (dar.matches) menu.parentNode.insertBefore(secici, menu);
      else menu.parentNode.insertBefore(menu, secici);
      if (odak && odak !== document.activeElement && (menu.contains(odak) || secici.contains(odak))) odak.focus({ preventScroll: true });
    };
    sirala();
    dar.addEventListener('change', sirala);
  }

  // Dil seçici: Esc kapatır ve odağı düğmeye döndürür; dışarı tıklama / odak çıkışı kapatır.
  var secicler = document.querySelectorAll('details.dil-sec');
  Array.prototype.forEach.call(secicler, function (d) {
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && d.open) { d.open = false; d.querySelector('summary').focus(); }
    });
    d.addEventListener('focusout', function (e) {
      if (d.open && e.relatedTarget && !d.contains(e.relatedTarget)) d.open = false;
    });
  });
  document.addEventListener('click', function (e) {
    Array.prototype.forEach.call(secicler, function (d) { if (d.open && !d.contains(e.target)) d.open = false; });
  });

  // 404: adres /<dil>/... ise o dilin yazıları
  var yok = document.getElementById('yok-metinler');
  if (yok) {
    try {
      var tum = JSON.parse(yok.textContent);
      var m = location.pathname.match(/^\/([a-z]{2})(\/|$)/);
      var dil = m && tum[m[1]] ? m[1] : null;
      if (dil) {
        var t = tum[dil];
        document.querySelector('.yok').lang = t.lang; // sadece değişen bölüm: üst menü ve alt bilgi İngilizce kalır
        document.title = t.baslik + ' · yesokay.';
        document.getElementById('yok-baslik').textContent = t.baslik;
        document.getElementById('yok-alt').textContent = t.alt;
        var b = document.getElementById('yok-buton');
        b.textContent = t.buton;
        b.href = '/' + dil + '/';
      }
    } catch (e) { /* İngilizce kalır */ }
  }
})();
