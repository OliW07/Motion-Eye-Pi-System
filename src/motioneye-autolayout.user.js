// ==UserScript==
// @name         MotionEye Auto Scroller (JSON Config)
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Auto slideshow or 2x2 grid for MotionEye using JSON config
// @match        http://*/
// @grant        GM_xmlhttpRequest
// @connect      *
// ==/UserScript==

(function () {
  'use strict';

  // Configuration

    
  //Storing Date/time stamp to avoid chrome caching file, preventing changes applying
  const CONFIG_URL = `http://${window.location.hostname}/security-cameras.json?nocache=${Date.now()}`;

  let cameraIDs = ['camera1', 'camera2', 'camera3', 'camera4'];
  let intervalSeconds = 5;
  let enableSlideShow = true;

  const host = window.location.hostname;
  if (!host.startsWith('192.168.') && !host.includes('motioneye') && !host.startsWith('raspberrypi.local')) return;


  function setElementStyles(el, styles = {}) {
    if (!el) return;
    Object.assign(el.style, styles);
  }

  function setCameraFullscreen(cam) {
    setElementStyles(cam, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      background: 'black',
    });

    const media = cam.querySelector('img, video');
    if (media) {
      setElementStyles(media, {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      });
    }
  }

  function hideFooter() {
    const footer = document.querySelector('.footer');
    if (footer) footer.style.display = 'none';
  }

  function hideHeader() {
    const style = document.createElement('style');
    style.textContent = `
      .header { opacity: 0; transition: opacity 0.3s; }
      .header:hover { opacity: 1; }
    `;
    document.head.appendChild(style);
  }

  function displayCamera(index) {
    cameraIDs.forEach((id, i) => {
      const cam = document.getElementById(id);
      if (!cam) return;
      setCameraFullscreen(cam);
      cam.style.display = i === index ? 'block' : 'none';
    });
  }

  function removePadding(){

    const container = document.querySelector('.page-container');
    container.style.padding = '0px';
    container.maxHeight = '100vh !important';

  }

  function displayGrid2x2() {
    hideFooter();
    hideHeader();
    removePadding();

    const gridStyles = [
      { top: '0', left: '0' },
      { top: '0', left: '50vw' },
      { top: '40vh', left: '0' },
      { top: '40vh', left: '50vw' },
    ];

    const camEls = document.querySelectorAll('div.page-container.two-columns div.camera-frame');



    camEls.forEach((id, i) => {
      const cam = document.getElementById(id);
      if (!cam) return;

      setElementStyles(cam, {
        position: 'fixed',
        top: gridStyles[i]?.top || '0',
        left: gridStyles[i]?.left || '0',
        width: '50vw',
        height: '50vh !important',
        display: 'block',
        background: 'black',
        zIndex: '9999', // ensures camera is above header/footer
      });

      const media = cam.querySelector('img, video');
      if (media) {
        setElementStyles(media, {
         /// width: '100%',
          height: '100%',
          objectFit: 'cover',
        });
      }
    });


  }

  function init() {
    if (!enableSlideShow) {
      if(cameraIDs.length < 4){
        console.log('Less than four cameras enable in config, showing static camera 1')
        setCameraFullscreen[document.getElementById(cameraIDs[0])];
      }else{
        console.log('Slideshow disabled; displaying 2x2 grid');
        displayGrid2x2();
      }


      return;
    }

    hideFooter();
    hideHeader();

    let index = 0;
    displayCamera(index);

    setInterval(() => {
      index = (index + 1) % cameraIDs.length;
      displayCamera(index);
    }, intervalSeconds * 1000);
  }

  // Load JSON Config

  GM_xmlhttpRequest({
    method: 'GET',
    url: CONFIG_URL,
    onload: function (response) {
      try {
        const config = JSON.parse(response.responseText);

        if (Array.isArray(config.cameraNames) && config.cameraNames.length > 0) {
          cameraIDs = config.cameraNames;
        }
        if (typeof config.slideShowIntervalMs === 'number') {
          intervalSeconds = config.slideShowIntervalMs / 1000;
        }
        if (typeof config.enableSlideShow === 'boolean') {
          enableSlideShow = config.enableSlideShow;
        }

        console.log('Loaded MotionEye JSON config:', config);
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
