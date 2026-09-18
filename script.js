/* PSR — Progressive Social Responsibility
   Interactions: nav, reveal, counters, testimonials, FAQ, contact form */

(function(){
  // ---------- Year ----------
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // ---------- Mobile nav ----------
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.nav');
  if (toggle && nav){
    function closeNav(){
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded','false');
    }

    toggle.addEventListener('click', function(){
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    nav.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        if (window.innerWidth <= 960){ closeNav(); }
      });
    });

    document.addEventListener('click', function(event){
      if (window.innerWidth > 960) return;
      if (!nav.contains(event.target) && !toggle.contains(event.target)) {
        closeNav();
      }
    });
  }

  // ---------- Reveal on scroll ----------
  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, {threshold:0.12, rootMargin:'0px 0px -40px 0px'});
    document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); });
  }

  // ---------- Animated counters ----------
  function animateCounter(el){
    var target = parseFloat(el.getAttribute('data-target')) || 0;
    var decimals = parseInt(el.getAttribute('data-decimals')) || 0;
    var duration = 1600;
    var start = performance.now();
    function tick(now){
      var p = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = decimals ? val.toFixed(decimals) : Math.floor(val).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = decimals ? target.toFixed(decimals) : Math.floor(target).toLocaleString();
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window){
    var cio = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){
          animateCounter(e.target);
          cio.unobserve(e.target);
        }
      });
    }, {threshold:0.4});
    document.querySelectorAll('[data-counter]').forEach(function(el){ cio.observe(el); });
  } else {
    document.querySelectorAll('[data-counter]').forEach(function(el){
      el.textContent = el.getAttribute('data-target');
    });
  }

  // ---------- Testimonials carousel ----------
  var track = document.querySelector('.testimonial-track');
  if (track){
    var slides = track.querySelectorAll('.testimonial-slide');
    var dotsWrap = document.querySelector('.tc-dots');
    var prev = document.querySelector('.tc-prev');
    var next = document.querySelector('.tc-next');
    var idx = 0;
    var autoTimer = null;

    // Build dots
    if (dotsWrap){
      slides.forEach(function(_, i){
        var d = document.createElement('button');
        d.className = 'tc-dot' + (i === 0 ? ' active' : '');
        d.setAttribute('aria-label','Show testimonial ' + (i+1));
        d.addEventListener('click', function(){ go(i); });
        dotsWrap.appendChild(d);
      });
    }
    function go(i){
      idx = (i + slides.length) % slides.length;
      slides.forEach(function(s){ s.style.transform = 'translateX(' + (-idx*100) + '%)'; });
      var dots = dotsWrap ? dotsWrap.querySelectorAll('.tc-dot') : [];
      dots.forEach(function(d,j){ d.classList.toggle('active', j===idx); });
      resetAuto();
    }
    function resetAuto(){
      if (autoTimer) clearInterval(autoTimer);
      autoTimer = setInterval(function(){ go(idx+1); }, 6000);
    }
    if (prev) prev.addEventListener('click', function(){ go(idx-1); });
    if (next) next.addEventListener('click', function(){ go(idx+1); });
    resetAuto();
    track.addEventListener('mouseenter', function(){ if (autoTimer) clearInterval(autoTimer); });
    track.addEventListener('mouseleave', resetAuto);
  }

  // ---------- FAQ Accordion ----------
  document.querySelectorAll('.faq-item').forEach(function(item){
    var q = item.querySelector('.faq-question');
    if (!q) return;
    q.addEventListener('click', function(){
      var isOpen = item.classList.contains('open');
      // Close siblings in the same list (optional single-open behavior)
      var parent = item.parentElement;
      if (parent){
        parent.querySelectorAll('.faq-item.open').forEach(function(el){ if (el !== item) el.classList.remove('open'); });
      }
      item.classList.toggle('open', !isOpen);
    });
  });

  // ---------- Contact form ----------
  var form = document.getElementById('contactForm');
  if (form){
    var note = document.getElementById('formNote');
    form.addEventListener('submit', function(ev){
      ev.preventDefault();
      note.classList.remove('error','success');
      var data = Object.fromEntries(new FormData(form).entries());
      // Simple validation
      if (!data.name || data.name.trim().length < 2){ note.textContent = 'Please enter your name.'; note.classList.add('error'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || '')){ note.textContent = 'Please enter a valid work email.'; note.classList.add('error'); return; }
      if (!data.message || data.message.trim().length < 10){ note.textContent = 'Please add a little context so we can help.'; note.classList.add('error'); return; }

      // Success + mailto fallback
      var subject = encodeURIComponent('CSR enquiry — ' + (data.service || 'General') + ' — ' + (data.organization || data.name));
      var body = encodeURIComponent(
        'Name: ' + data.name + '\n' +
        'Organization: ' + (data.organization || '—') + '\n' +
        'Email: ' + data.email + '\n' +
        'Service: ' + (data.service || '—') + '\n\n' +
        'Context:\n' + data.message
      );
      note.textContent = 'Thanks — opening your email client to send the enquiry to contact@prosr.in.';
      note.classList.add('success');
      window.location.href = 'mailto:contact@prosr.in?subject=' + subject + '&body=' + body;
    });
  }

  // ---------- Header shadow on scroll ----------
  var header = document.querySelector('.site-header');
  if (header){
    var lastY = 0;
    window.addEventListener('scroll', function(){
      var y = window.scrollY;
      if (y > 20) header.style.boxShadow = '0 6px 24px rgba(10,30,34,.06)';
      else header.style.boxShadow = 'none';
      lastY = y;
    }, {passive:true});
  }
})();
