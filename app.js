'use strict';
(function (window) {
  var prms = {
    angularSpeed: 0.001,//Math.PI / 10;,
    point: {
      color: '#ff0000',
      lineWidth: 1,
      radius: 1,
      xOffset: 0, // pour créer une irrégularité : tourne pas complètement rond
      yOffset: 0
    },
    dimensions: {
      squareSize: 600,
      scaleFactor: 1,
      lineWidth: 3,
      circleFactor: 0.4,
      circleColor: '#325FA2',
      innerCircleColor: '#995FA2',
      innerCircleRadius: 50,
    }
  };
  var lastSeq = 0;
  // currentAngle (=alpha) est l'angle de rotation du cercle interne
  // quand le cercle interne tourne de alpha, on considère qu'il roule sur le bord intérieur
  // du cercle externe, son centre subit une rotation de centre le centre du cercle externe (O)
  // et d'un angle                r
  //              beta = alpha * ---
  //                              R
  var currentAngle = 0;
  var currentAngleStep = 0; // cumul de valeur d'angle sans le modulo 2Pi
  var points = [];
  var pointing = null; // if mouse down
  var inking = false;

  console.log('externalCircleRadius', prms.dimensions.squareSize * prms.dimensions.circleFactor);
  function draw() {


    var ctx = document.getElementById('canvas').getContext('2d');
    currentAngleStep = currentAngle + prms.angularSpeed;
    currentAngle = (currentAngle + prms.angularSpeed) % (2 * Math.PI);
    ctx.save();
    ctx.clearRect(0, 0, prms.dimensions.squareSize, prms.dimensions.squareSize);
    ctx.translate(prms.dimensions.squareSize / 2, prms.dimensions.squareSize / 2);
    ctx.scale(prms.dimensions.scaleFactor, prms.dimensions.scaleFactor);
    ctx.strokeStyle = prms.dimensions.circleColor;
    ctx.lineWidth = prms.dimensions.lineWidth;
    // ctx.rotate(currentAngle);


    // draw external circle
    var externalCircleRadius = prms.dimensions.squareSize * prms.dimensions.circleFactor;
    // a mark
    ctx.beginPath();
    ctx.moveTo(prms.dimensions.squareSize * prms.dimensions.circleFactor + 15, 0);
    ctx.lineTo(prms.dimensions.squareSize * prms.dimensions.circleFactor, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = prms.dimensions.circleColor;
    ctx.arc(0, 0, externalCircleRadius, 0, Math.PI * 2, true);
    ctx.stroke();

    // inner Circle
    // initial (x, y) = o, center of c
    var initialcX = prms.dimensions.innerCircleRadius - externalCircleRadius + prms.dimensions.lineWidth;
    var initialcY = 0;
    var beta = currentAngleStep * prms.dimensions.innerCircleRadius / externalCircleRadius;
    console.log(beta)

    var o = rotatePoint({ x: initialcX, y: initialcY }, beta);

    drawInnerCircle(ctx, o, currentAngle);

    var aTestPoint = { x: 20, y: -prms.dimensions.innerCircleRadius + 20 };

    if (inking) addPoint(currentPointPosition(aTestPoint, o, currentAngle));

    // // draw points
    points.forEach((point) => drawPoint(ctx, point));

    ctx.restore();
    window.requestAnimationFrame(draw)
  }

  function clear() {
    points = [];
  }

  function deleteLastSeq() {
    points = points.filter(p => p.seq < lastSeq);
    lastSeq = getLastSeq();
  }
  function getLastSeq() {
    return points.length ? Math.max.apply(null, points.map(item => item.seq)) : 0;
  }

  // position du stylo
  function currentPointPosition(pointInitialPosition, innerCircleCenter, alpha) {
    return translatePoint(
      rotatePoint(pointInitialPosition, -alpha),
      innerCircleCenter);
  }

  function drawInnerCircle(ctx, point, alpha) {
    ctx.strokeStyle = prms.dimensions.innerCircleColor;

    // a mark
    var markStart = translatePoint(
      rotatePoint({ x: 0, y: -prms.dimensions.innerCircleRadius }, -alpha),
      point);
    var markEnd = translatePoint(
      rotatePoint({ x: 0, y: -prms.dimensions.innerCircleRadius + 10 }, -alpha),
      point);

    ctx.beginPath();
    ctx.moveTo(markStart.x, markStart.y);
    ctx.lineTo(markEnd.x, markEnd.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(point.x, point.y, prms.dimensions.innerCircleRadius, 0, Math.PI * 2, true);
    ctx.stroke();

  }

  function start() { inking = true; }
  function stop() { inking = false; }

  function drawPoint(ctx, point) {
    ctx.beginPath();
    ctx.lineWidth = point.lineWidth;
    ctx.strokeStyle = point.color;
    ctx.fillStyle = point.color;
    ctx.arc(point.x + prms.point.xOffset, point.y + prms.point.yOffset, point.radius, 0, Math.PI * 2, true);
    ctx.stroke();
  }

  function addPoint(p) {
    points.push(Object.assign({}, prms.point, p, { seq: lastSeq }));
  }
  // function addPoint(event) {
  //   var p = correctPosition({ x: event.layerX, y: event.layerY });
  //   // if(isInInnerCircle(p))
  //   //   points.push(Object.assign({}, prms.point, p, { seq: lastSeq }));
  // }
  // function isInInnerCircle(p) {
  //   var translated = translatePoint(p, oppPoint(o));
  //   return (Math.pow(translated.x, 2) + Math.pow(translated.y, 2) < Math.pow(prms.dimensions.innerCircleRadius, 2));
  // }

  // function correctPosition(p) {
  //   return rotatePoint({
  //     x: p.x * 1 / prms.dimensions.scaleFactor - prms.dimensions.squareSize / 2 * 1 / prms.dimensions.scaleFactor,
  //     y: p.y * 1 / prms.dimensions.scaleFactor - prms.dimensions.squareSize / 2 * 1 / prms.dimensions.scaleFactor,
  //   }, currentAngle);
  // }

  function rotatePoint(p, alpha) {
    return {
      x: p.x * Math.cos(alpha) - p.y * Math.sin(alpha),
      y: p.x * Math.sin(alpha) + p.y * Math.cos(alpha)
    }
  }

  function oppPoint(p) {
    return {
      x: -p.x,
      y: -p.y,
    }
  }

  function translatePoint(p, q) {
    return {
      x: p.x + q.x,
      y: p.y + q.y,
    }
  }

  var canvasElt = document.getElementById('canvas');
  canvasElt.setAttribute('width', prms.dimensions.squareSize);
  canvasElt.setAttribute('height', prms.dimensions.squareSize);
  canvasElt.addEventListener('click', addPoint, false);
  canvasElt.addEventListener('mousedown', (event) => { lastSeq++; pointing = event; }, false);
  canvasElt.addEventListener('mousemove', (event) => { if (pointing) pointing = event }, false);
  canvasElt.addEventListener('mouseup', (event) => pointing = null, false);

  // on fait une interface avec l'extérieur
  window.requestAnimationFrame(draw);
  window.pottingWheelPrms = prms;
  window.pottingWheelPrms.start = start;
  window.pottingWheelPrms.stop = stop;
  window.pottingWheelPrms.clear = clear;
  window.pottingWheelPrms.undo = deleteLastSeq;
})(window);

(function (window) {
  if (window.pottingWheelPrms) {

    document.getElementById('angular-speed').value = Math.round(window.pottingWheelPrms.angularSpeed * 1000);
    document.getElementById('color').value = window.pottingWheelPrms.point.color;
    document.getElementById('lineWidth').value = window.pottingWheelPrms.point.lineWidth;
    document.getElementById('radius').value = window.pottingWheelPrms.point.radius;

    document.getElementById('angular-speed')
      .addEventListener('change', (event) => {
        window.pottingWheelPrms.angularSpeed = event.target.value / 1000;
      });
    mapPointOption('color', 'color');
    mapPointOption('radius', 'radius');
    mapPointOption('lineWidth', 'lineWidth');

    mapAction('start', 'start');
    mapAction('stop', 'stop');
    mapAction('clear', 'clear');
    mapAction('undo', 'undo');

    function mapAction(idHtml, actionName) {
      document.getElementById(idHtml)
        .addEventListener('click', (event) => {
          window.pottingWheelPrms[actionName]();
        });
    }

    function mapPointOption(idHtml, optionName) {
      document.getElementById(idHtml)
        .addEventListener('change', (event) => {
          window.pottingWheelPrms.point[optionName] = event.target.value;
        });
    }
  }
})(window);