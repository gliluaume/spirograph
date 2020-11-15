import { IPoint, isInCircle, oppPoint, rotatePoint, translatePoint, o } from "./geometry"
import { Dot, Parameters } from "./Parameters"


export class Spirograph {
    private ctx: any
    private window: any

    // currentAngle (=alpha) est l'angle de rotation du cercle interne
    // quand le cercle interne tourne de alpha, on considère qu'il roule sur le bord intérieur
    // du cercle externe, son centre subit une rotation de centre le centre du cercle externe (O)
    // et d'un angle                    r
    //                  beta = alpha * ---
    //                                  R
    private currentAngle: number
    private currentAngleStep: number
    private beta: number
    private points: Dot[]
    private pointing: boolean
    private inking: boolean
    private step: number
    private lastSeq: number
    private o: IPoint
    private O: IPoint

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
        this.O = {
            x: this.prms.dimensions.squareSize / 2,
            y: this.prms.dimensions.squareSize / 2,
        }
    }

    public setCanvasContext(eltId: string) {
        this.ctx = (document.getElementById(eltId) as any).getContext('2d');
    }

    public draw() {
        this.currentAngleStep = this.currentAngleStep + this.prms.angularSpeed;
        this.currentAngle = (this.currentAngle + this.prms.angularSpeed) % (2 * Math.PI);
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.prms.dimensions.squareSize, this.prms.dimensions.squareSize);
        // this.ctx.translate(this.prms.dimensions.squareSize / 2, this.prms.dimensions.squareSize / 2);
        this.ctx.translate(this.O.x, this.O.y);
        this.ctx.scale(this.prms.dimensions.scaleFactor, this.prms.dimensions.scaleFactor);

        // Debug: draw axis
        this.ctx.lineWidth = 1
        this.ctx.beginPath();
        this.ctx.moveTo(-300, 0);
        this.ctx.lineTo(300, 0);
        this.ctx.moveTo(0, -300);
        this.ctx.lineTo(0, 300);
        this.ctx.stroke();

        // draw external circle
        this.ctx.strokeStyle = this.prms.dimensions.circleColor;
        this.ctx.lineWidth = this.prms.dimensions.lineWidth;
        const outterCircleRadius = this.prms.dimensions.outterCircleRadius;
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.prms.dimensions.circleColor;
        this.ctx.arc(0, 0, outterCircleRadius, 0, Math.PI * 2, true);
        this.ctx.stroke();

        // inner Circle
        // initial (x, y) = o, center of c
        const initialcX = this.prms.dimensions.innerCircleRadius - outterCircleRadius + this.prms.dimensions.lineWidth;
        const initialcY = 0;
        this.beta = this.currentAngleStep * this.prms.dimensions.innerCircleRadius / outterCircleRadius;
        // console.log((new Date()).getTime(), points.length)

        this.o = rotatePoint({ x: initialcX, y: initialcY }, this.beta);

        this.drawInnerCircle(this.o, this.currentAngle);

        // this.prms.penPosition = { x: 35, y: 20 };

        if (this.inking && (this.step % this.prms.frequency === 0)) {
            this.addPoint(this.currentPenPosition());
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
    private currentPenPosition() {
        return translatePoint(
            rotatePoint(this.prms.penPosition, -this.currentAngle),
            this.o);
    }

    private drawInnerCircle(point: IPoint, alpha: number) {
        this.ctx.strokeStyle = this.prms.dimensions.innerCircleColor;

        // a mark
        const markStart = translatePoint(
            rotatePoint({ x: 0, y: -this.prms.dimensions.innerCircleRadius }, -alpha),
            point);
        const markEnd = translatePoint(
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
        this.ctx.lineWidth = point.lineWidth || 3;
        this.ctx.strokeStyle = point.color || '#000000';
        this.ctx.fillStyle = point.color || '#000000';
        this.ctx.moveTo(point.x + this.prms.point.xOffset, point.y + this.prms.point.yOffset);
        this.ctx.lineTo(point.x + this.prms.point.xOffset + 1, point.y + this.prms.point.yOffset);
        this.ctx.stroke();
    }

    /** positionne le point sur le cercle interne */
    private setPenPosition(event: any) {
        const p = this.correctPosition({ x: event.layerX, y: event.layerY });
        if (this.isInInnerCircle(p)) {
            const oTranslation = (p: IPoint) => translatePoint(p, oppPoint(this.o))
            const oRotation = (p: IPoint) => rotatePoint(p, this.currentAngle)
            this.prms.penPosition = o(oRotation, oTranslation)(p)
        }
    }

    private isInInnerCircle(p: IPoint) {
        return isInCircle(p, { center: this.o, radius: this.prms.dimensions.innerCircleRadius })
    }

    private addPoint(p: IPoint) {
        this.points.push(Object.assign({}, this.prms.point, p, { seq: this.lastSeq }));
    }

    private correctPosition(p: IPoint): IPoint {
        return translatePoint(p, oppPoint(this.O))
    }

    public link() {
        const canvasElt = document.getElementById('canvas');
        canvasElt.setAttribute('width', this.prms.dimensions.squareSize.toString());
        canvasElt.setAttribute('height', this.prms.dimensions.squareSize.toString());
        canvasElt.addEventListener('click', this.setPenPosition.bind(this), false);

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
