/* eslint-disable @typescript-eslint/no-explicit-any */
import { IPoint, isInCircle, oppPoint, rotatePoint, translatePoint, o, eq } from "./geometry"
import { Dot, EStyle, Parameters } from "./Parameters"


export class Spirograph {
    private window: any
    private ctxPaper: any
    private ctxInnerCircle: any

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
    private inking: boolean
    private step: number
    private lastSeq: number
    private o: IPoint
    private O: IPoint
    private originalPenPosition: IPoint

    public prms: Parameters

    constructor(window: Window) {
        this.window = window

        this.currentAngle = 0
        this.currentAngleStep = 0 // cumul de valeur d'angle sans le modulo 2Pi
        this.points = []
        this.inking = false
        this.step = 0
        this.lastSeq = 0
        this.o = null
        this.prms = new Parameters()
        this.O = {
            x: this.prms.dimensions.squareSize / 2,
            y: this.prms.dimensions.squareSize / 2,
        }

        // TODO refactor cf this.o in draw
        this.originalPenPosition = {
            x: this.prms.dimensions.innerCircleRadius - this.prms.dimensions.outterCircleRadius + this.prms.dimensions.lineWidth,
            y: 0,
        }
    }

    public draw(): void {
        this.currentAngleStep = this.currentAngleStep + this.prms.angularSpeed;
        this.currentAngle = (this.currentAngle + this.prms.angularSpeed) % (2 * Math.PI);
        this.ctxPaper.save();
        this.ctxPaper.clearRect(0, 0, this.prms.dimensions.squareSize, this.prms.dimensions.squareSize);
        this.ctxPaper.translate(this.O.x, this.O.y);
        this.ctxPaper.scale(this.prms.dimensions.scaleFactor, this.prms.dimensions.scaleFactor);

        this.ctxPaper.lineWidth = this.prms.dimensions.lineWidth;
        const outterCircleRadius = this.prms.dimensions.outterCircleRadius;

        // inner Circle
        // initial (x, y) = o, center of c
        const initialcX = this.prms.dimensions.innerCircleRadius - outterCircleRadius + this.prms.dimensions.lineWidth;
        const initialcY = 0;
        this.beta = this.currentAngleStep * this.prms.dimensions.innerCircleRadius / outterCircleRadius;
        // console.log((new Date()).getTime(), points.length)

        this.o = rotatePoint({ x: initialcX, y: initialcY }, this.beta);

        this.drawInnerCircle(this.o, this.currentAngle);

        if (this.inking && (this.step % this.prms.frequency === 0)) {
            this.addPoint(this.currentPenPosition());
        }

        // draw points (TODO refactor)
        if (this.prms.style === EStyle.line) {
            this.points.forEach((point, index) => {
                if (index > 0 && !point.firstOfSequence) {
                    // const previousPoint = this.points[index - 1]
                    const previousPoint = this.points[index - 1]
                    if (!previousPoint.firstOfSequence) {
                        this.drawLine(previousPoint, point)
                    }
                }
            });
        } else if (this.prms.style === EStyle.dot) {
            this.points.forEach((point) => this.drawPoint(point));
        }

        this.ctxPaper.restore();
        this.step++;
        setTimeout(() => this.window.requestAnimationFrame(this.draw.bind(this)), 30)
        // this.window.requestAnimationFrame(this.draw.bind(this))
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
        return this.asFixedCoordinates(this.prms.penPosition)
    }

    private drawInnerCircle(point: IPoint, alpha: number) {
        this.ctxInnerCircle.save();
        this.ctxInnerCircle.clearRect(0, 0, this.prms.dimensions.squareSize, this.prms.dimensions.squareSize);
        this.ctxInnerCircle.translate(this.O.x, this.O.y);
        this.ctxInnerCircle.scale(this.prms.dimensions.scaleFactor, this.prms.dimensions.scaleFactor);

        this.ctxInnerCircle.strokeStyle = this.prms.dimensions.innerCircleColor;

        // a grid
        const verticalStart = translatePoint(
            rotatePoint({ x: 0, y: -this.prms.dimensions.innerCircleRadius }, -alpha),
            point);
        const verticalEnd = translatePoint(
            rotatePoint({ x: 0, y: this.prms.dimensions.innerCircleRadius }, -alpha),
            point);
        const horizontalStart = translatePoint(
            rotatePoint({ x: -this.prms.dimensions.innerCircleRadius, y: 0 }, -alpha),
            point);
        const horizontalEnd = translatePoint(
            rotatePoint({ x: this.prms.dimensions.innerCircleRadius, y: 0 }, -alpha),
            point);

        this.ctxInnerCircle.beginPath();
        this.ctxInnerCircle.moveTo(verticalStart.x, verticalStart.y);
        this.ctxInnerCircle.lineTo(verticalEnd.x, verticalEnd.y);
        this.ctxInnerCircle.moveTo(horizontalStart.x, horizontalStart.y);
        this.ctxInnerCircle.lineTo(horizontalEnd.x, horizontalEnd.y);
        this.ctxInnerCircle.stroke();

        this.ctxInnerCircle.beginPath();
        this.ctxInnerCircle.arc(point.x, point.y, this.prms.dimensions.innerCircleRadius, 0, Math.PI * 2, true);
        this.ctxInnerCircle.stroke();

        this.ctxInnerCircle.restore();
    }

    private start() { this.inking = true; }
    private stop() { this.inking = false; }
    private stopCircle() { this.prms.angularSpeed = 0; }

    private drawLine(a: Dot, b: Dot) {
        this.ctxPaper.beginPath();
        this.ctxPaper.lineWidth = a.lineWidth || 3;
        this.ctxPaper.strokeStyle = a.color || '#000000';
        this.ctxPaper.fillStyle = a.color || '#000000';
        this.ctxPaper.moveTo(a.x, a.y);
        this.ctxPaper.lineTo(b.x, b.y);
        this.ctxPaper.stroke();
    }

    private drawPoint(point: Dot) {
        this.ctxPaper.beginPath();
        this.ctxPaper.lineWidth = point.lineWidth || 3;
        this.ctxPaper.strokeStyle = point.color || '#000000';
        this.ctxPaper.fillStyle = point.color || '#000000';
        this.ctxPaper.moveTo(point.x + this.prms.point.xOffset, point.y + this.prms.point.yOffset);
        this.ctxPaper.lineTo(point.x + this.prms.point.xOffset + 1, point.y + this.prms.point.yOffset);
        this.ctxPaper.stroke();
    }

    /** positionne le point sur le cercle interne */
    private setPenPosition(event: any) {
        const p = this.correctPosition({ x: event.layerX, y: event.layerY });
        if (this.isInInnerCircle(p)) {
            this.originalPenPosition = p
            this.prms.penPosition = this.asInnerCircleCoordinates(p)
        }
    }

    private asInnerCircleCoordinates(p: IPoint) {
        const oTranslation = (p: IPoint) => translatePoint(p, oppPoint(this.o))
        const oRotation = (p: IPoint) => rotatePoint(p, this.currentAngle)
        return o(oRotation, oTranslation)(p)
    }

    private asFixedCoordinates(p: IPoint) {
        return translatePoint(
            rotatePoint(p, -this.currentAngle),
            this.o);
    }

    private isInInnerCircle(p: IPoint) {
        return isInCircle(p, { center: this.o, radius: this.prms.dimensions.innerCircleRadius })
    }

    private addPoint(p: IPoint) {
        const firstOfSequence = eq(this.originalPenPosition, p)
        const dot = Object.assign(new Dot(), this.prms.point, p, { firstOfSequence, seq: this.lastSeq })
        this.points.push(dot);
    }

    private correctPosition(p: IPoint): IPoint {
        return translatePoint(p, oppPoint(this.O))
    }

    public save(): void {
        const canvas = document.getElementById('paper') as any;
        const imageDl = document.getElementById('canvasImgDl') as any;
        imageDl.href = canvas.toDataURL();
        document.getElementById('canvasImgDl').click()
    }

    public link(): void {
        // on fait une interface avec l'extérieur
        this.window.requestAnimationFrame(this.draw.bind(this));
        this.window.pottingWheelPrms = this.prms;
        this.window.pottingWheelPrms.start = this.start.bind(this);
        this.window.pottingWheelPrms.stop = this.stop.bind(this);
        this.window.pottingWheelPrms.stopCircle = this.stopCircle.bind(this);
        this.window.pottingWheelPrms.clear = this.clear.bind(this);
        this.window.pottingWheelPrms.undo = this.deleteLastSeq.bind(this);
        this.window.pottingWheelPrms.save = this.save.bind(this);
    }

    public createLayers(): void {
        const [fixed, paper, innerCircle] = ['fixed', 'paper', 'innerCircle'].map((id: string) => {
            const canvas = document.createElement('canvas')
            canvas.setAttribute('id', id)
            return canvas
        })

        innerCircle.addEventListener('click', this.setPenPosition.bind(this), false);

        const container = document.getElementById('container');
        container.style.height = `${this.prms.dimensions.squareSize}px`
        container.style.width = `${this.prms.dimensions.squareSize}px`

            ;[fixed, paper, innerCircle].forEach(elt => {
                elt.setAttribute('width', this.prms.dimensions.squareSize.toString());
                elt.setAttribute('height', this.prms.dimensions.squareSize.toString());
                container.appendChild(elt)
            })
        this.createFixedElements('fixed')
        this.ctxPaper = this.get2dContext('paper');
        this.ctxInnerCircle = this.get2dContext('innerCircle');
    }

    private get2dContext(eltId: string): void {
        return (document.getElementById(eltId) as any).getContext('2d');
    }


    private createFixedElements(eltId: string) {
        const context = (document.getElementById(eltId) as any).getContext('2d');
        context.save();
        context.clearRect(0, 0, this.prms.dimensions.squareSize, this.prms.dimensions.squareSize);
        context.translate(this.O.x, this.O.y);
        context.scale(this.prms.dimensions.scaleFactor, this.prms.dimensions.scaleFactor);

        // Debug: draw axis
        context.lineWidth = 1
        context.beginPath();
        context.moveTo(-this.prms.dimensions.squareSize, 0);
        context.lineTo(this.prms.dimensions.squareSize, 0);
        context.moveTo(0, -this.prms.dimensions.squareSize);
        context.lineTo(0, this.prms.dimensions.squareSize);
        context.stroke();

        // draw external circle
        console.log(this)
        context.strokeStyle = this.prms.dimensions.circleColor;
        context.lineWidth = this.prms.dimensions.lineWidth;
        const outterCircleRadius = this.prms.dimensions.outterCircleRadius;
        context.beginPath();
        context.strokeStyle = this.prms.dimensions.circleColor;
        context.arc(0, 0, outterCircleRadius, 0, Math.PI * 2, true);
        context.stroke();
    }
}
