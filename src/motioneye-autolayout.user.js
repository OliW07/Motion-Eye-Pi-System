// ==UserScript==
// @name         MotionEye Auto Grid / Slideshow (JSON Config)
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  Auto slideshow or fullscreen 2x2 grid for MotionEye cameras using external JSON config
// @match        http://*/
// @grant        GM_xmlhttpRequest
// @connect      *
// ==/UserScript==

(function () {
  'use strict';

  const CONFIG_URL = `http://${window.location.hostname}/security-cameras.json?nocache=${Date.now()}`;

  var intervalSeconds, enableSlideShow;

  const gridRows = 2;
  const gridCols = 2;

  const host = window.location.hostname;
  if (
    !host.startsWith('192.168.') &&
    !host.includes('motioneye') &&
    !host.startsWith('raspberrypi.local')
  )
  {return};


  // UTILITIES

  function setStyles(el, styles = {}) {
    if (!el) return;
    Object.entries(styles).forEach(([prop, val]) => {
      el.style.setProperty(prop, val, 'important');
    });
  }

  //Dynanically edit the motioneye CSS to enable a full app-like experience

  function hideUI() {
    const hideSelectors = [
      '.navbar',
      '.footer',
      '#footer',
      '.page-header',
      '.page-footer',
      '.sidebar',
      '#sidebar'
    ];
    hideSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => (el.style.display = 'none'));
    });
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';

    const invisbleHeaderStyleSheet = document.createElement('style');
    invisbleHeaderStyleSheet.textContent = `
      .header {
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .header:hover {
        opacity: 1;
      }
    `;
    document.head.appendChild(invisbleHeaderStyleSheet);


  }

  function setupStaticGrid() {
    const cameras = document.querySelectorAll('div.camera-frame');
    if (cameras.length === 0) {
      console.log('No camera frames yet, retrying...');
      setTimeout(setupStaticGrid, 500);
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const camWidth = viewportWidth / gridCols;
    const camHeight = viewportHeight / gridRows;

    cameras.forEach((cam, index) => {
      const row = Math.floor(index / gridCols);
      const col = index % gridCols;
      setStyles(cam, {
        position: 'fixed',
        top: `${row * camHeight}px`,
        left: `${col * camWidth}px`,
        width: `${camWidth}px`,
        height: `${camHeight}px`,
        display: 'block',
        margin: '0',
        padding: '0',
        background: 'black',
        zIndex: '9999'
      });

      const media = cam.querySelector('img, video');
      if (media) {
        setStyles(media, {
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        });
      }
    });
  }

  function setupSlideShow() {
    const cameras = document.querySelectorAll('div.camera-frame');
    if (cameras.length === 0) {
      console.log('No camera frames yet, retrying slideshow...');
      setTimeout(setupSlideShow, 500);
      return;
    }

    let index = 0;
    cameras.forEach((cam, i) => {
      setStyles(cam, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        background: 'black',
        display: i === 0 ? 'block' : 'none'
      });

      const media = cam.querySelector('img, video');
      if (media) {
        setStyles(media, {
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        });
      }
    });

    setInterval(() => {
      cameras[index].style.display = 'none';
      index = (index + 1) % cameras.length;
      cameras[index].style.display = 'block';
    }, intervalSeconds * 1000);
  }

  function init() {
    hideUI();

    if (enableSlideShow) {
      console.log('Slideshow enabled');
      setupSlideShow();
    } else {
      console.log('Static 2x2 grid enabled');
      setupStaticGrid();
      window.addEventListener('resize', setupStaticGrid);
    }
  }

  // LOAD JSON CONFIG

  GM_xmlhttpRequest({
    method: 'GET',
    url: CONFIG_URL,
    onload: function (response) {
      try {
        const config = JSON.parse(response.responseText);
        console.log('Loaded JSON config:', config);

        if (Array.isArray(config.cameraNames) && config.cameraNames.length > 0)
        {cameraIDs = config.cameraNames;}
        if (typeof config.slideShowIntervalMs === 'number')
        { intervalSeconds = config.slideShowIntervalMs / 1000;}
        if (typeof config.enableSlideShow === 'boolean')
        {enableSlideShow = config.enableSlideShow;}
      } catch (e) {
        console.warn('Failed to parse JSON config, using defaults', e);
      }
      init();
    },
    onerror: function () {
      console.warn('Failed to fetch JSON config, using defaults');
      init();
    }
  });
})();
