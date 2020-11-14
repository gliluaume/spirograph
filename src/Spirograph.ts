import { IPoint, oppPoint, rotatePoint, translatePoint } from "./geometry"
import { Dot, Parameters } from "./Parameters"

export class Spirograph {
    private ctx: any
    private window: any

    private currentAngle: number
    private currentAngleStep: number
    private points: Dot[]
    private pointing: boolean
    private inking: boolean
    private step: number
    private lastSeq: number
    private o: IPoint

    public prms: Parameters

    constructor(window: any) {
        this.setCanvasContext('canvas')
        this.window = window

        this.currentAngle = 0
        this.currentAngleStep = 0 // cumul de valeur d'angle sans le modulo 2Pi
        this.points = []
        this.pointing = null // if mouse down
        this.inking = false
        this.step = 0
        this.lastSeq = 0
        this.o = null
        this.prms = new Parameters()
    }

    public setCanvasContext(eltId: string) {
        this.ctx = (document.getElementById(eltId) as any).getContext('2d');
    }

    public draw() {
        this.currentAngleStep = this.currentAngleStep + this.prms.angularSpeed;
        this.currentAngle = (this.currentAngle + this.prms.angularSpeed) % (2 * Math.PI);
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.prms.dimensions.squareSize, this.prms.dimensions.squareSize);
        this.ctx.translate(this.prms.dimensions.squareSize / 2, this.prms.dimensions.squareSize / 2);
        this.ctx.scale(this.prms.dimensions.scaleFactor, this.prms.dimensions.scaleFactor);
        this.ctx.strokeStyle = this.prms.dimensions.circleColor;
        this.ctx.lineWidth = this.prms.dimensions.lineWidth;

        // draw external circle
        var externalCircleRadius = this.prms.dimensions.squareSize * this.prms.dimensions.circleFactor;
        // a mark
        this.ctx.beginPath();
        this.ctx.moveTo(this.prms.dimensions.squareSize * this.prms.dimensions.circleFactor + 15, 0);
        this.ctx.lineTo(this.prms.dimensions.squareSize * this.prms.dimensions.circleFactor, 0);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.strokeStyle = this.prms.dimensions.circleColor;
        this.ctx.arc(0, 0, externalCircleRadius, 0, Math.PI * 2, true);
        this.ctx.stroke();

        // inner Circle
        // initial (x, y) = o, center of c
        var initialcX = this.prms.dimensions.innerCircleRadius - externalCircleRadius + this.prms.dimensions.lineWidth;
        var initialcY = 0;
        var beta = this.currentAngleStep * this.prms.dimensions.innerCircleRadius / externalCircleRadius;
        // console.log((new Date()).getTime(), points.length)

        this.o = rotatePoint({ x: initialcX, y: initialcY }, beta);

        this.drawInnerCircle(this.o, this.currentAngle);

        this.prms.penPosition = { x: 20, y: -this.prms.dimensions.innerCircleRadius + 20 };

        if (this.inking && (this.step % this.prms.frequency === 0)) {
            this.addPoint(this.currentPointPosition(this.prms.penPosition, this.o, this.currentAngle));
        }

        // draw points
        this.points.forEach((point) => this.drawPoint(point));

        this.ctx.restore();
        this.step++;
        // setTimeout(() => window.requestAnimationFrame(draw), 10)
        this.window.requestAnimationFrame(this.draw.bind(this))
    }

    private clear() {
        this.points = [];
    }

    private deleteLastSeq() {
        this.points = this.points.filter(p => p.seq < this.lastSeq);
        this.lastSeq = this.getLastSeq();
    }

    private getLastSeq() {
        return this.points.length
            ? Math.max.apply(null, this.points.map(point => point.seq))
            : 0;
    }

    // position du stylo
    private currentPointPosition(pointInitialPosition: IPoint, innerCircleCenter: IPoint, alpha: number) {
        return translatePoint(
            rotatePoint(pointInitialPosition, -alpha),
            innerCircleCenter);
    }

    private drawInnerCircle(point: IPoint, alpha: number) {
        this.ctx.strokeStyle = this.prms.dimensions.innerCircleColor;

        // a mark
        var markStart = translatePoint(
            rotatePoint({ x: 0, y: -this.prms.dimensions.innerCircleRadius }, -alpha),
            point);
        var markEnd = translatePoint(
            rotatePoint({ x: 0, y: -this.prms.dimensions.innerCircleRadius + 10 }, -alpha),
            point);

        this.ctx.beginPath();
        this.ctx.moveTo(markStart.x, markStart.y);
        this.ctx.lineTo(markEnd.x, markEnd.y);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, this.prms.dimensions.innerCircleRadius, 0, Math.PI * 2, true);
        this.ctx.stroke();
    }

    private start() { this.inking = true; }
    private stop() { this.inking = false; }
    private stopCircle() { this.prms.angularSpeed = 0; }

    private drawPoint(point: Dot) {
        this.ctx.beginPath();
        this.ctx.lineWidth = point.lineWidth;
        this.ctx.strokeStyle = point.color;
        this.ctx.fillStyle = point.color;
        this.ctx.moveTo(point.x + this.prms.point.xOffset, point.y + this.prms.point.yOffset);
        this.ctx.lineTo(point.x + this.prms.point.xOffset + 1, point.y + this.prms.point.yOffset);
        this.ctx.stroke();
    }

    /** positionne le point sur le cercle interne */
    private setPen(event: any) {
        var p = this.correctPosition({ x: event.layerX, y: event.layerY });
        console.log('clic', event, p, this.o)
        if (this.isInInnerCircle(p)) {
            console.log('dans le cercle')
        }
    }
    private isInInnerCircle(p) {
        var translated = translatePoint(p, oppPoint(this.o));
        console.log('translated', translated, 'of', p);
        return (Math.pow(translated.x, 2) + Math.pow(translated.y, 2) < Math.pow(this.prms.dimensions.innerCircleRadius, 2));
    }

    private addPoint(p: IPoint) {
        this.points.push(Object.assign({}, this.prms.point, p, { seq: this.lastSeq }));
    }

    private correctPosition(p: IPoint): IPoint {
        return rotatePoint({
            x: p.x * 1 / this.prms.dimensions.scaleFactor - this.prms.dimensions.squareSize / 2 * 1 / this.prms.dimensions.scaleFactor,
            y: p.y * 1 / this.prms.dimensions.scaleFactor - this.prms.dimensions.squareSize / 2 * 1 / this.prms.dimensions.scaleFactor,
        }, this.currentAngle);
    }

    public link() {
        var canvasElt = document.getElementById('canvas');
        canvasElt.setAttribute('width', this.prms.dimensions.squareSize.toString());
        canvasElt.setAttribute('height', this.prms.dimensions.squareSize.toString());
        canvasElt.addEventListener('click', this.setPen, false);

        // on fait une interface avec l'extérieur
        this.window.requestAnimationFrame(this.draw.bind(this));
        this.window.pottingWheelPrms = this.prms;
        this.window.pottingWheelPrms.start = this.start.bind(this);
        this.window.pottingWheelPrms.stop = this.stop.bind(this);
        this.window.pottingWheelPrms.stopCircle = this.stopCircle.bind(this);
        this.window.pottingWheelPrms.clear = this.clear.bind(this);
        this.window.pottingWheelPrms.undo = this.deleteLastSeq.bind(this);
    }
}
