import { IPoint } from './geometry'


export enum EStyle {
    dot = 'dot',
    line = 'line',
}

export class Parameters {
    public angularSpeed: number
    public addPointPeriod: number
    public drawPeriod: number
    // Position du stylo relativement au cercle interne
    public penPosition: IPoint
    public point: Dot // TODO renommer en 'dot'
    public dimensions: Dimensions
    public style: EStyle
    public showGrid: boolean

    constructor() {
        this.angularSpeed = 0
        this.addPointPeriod = 1
        this.drawPeriod = 30
        this.penPosition = { x: 0, y: 0 }
        this.point = new Dot()
        this.dimensions = new Dimensions()
        this.style = EStyle.line
        this.showGrid = true
    }
}
export class Dot implements IPoint {
    public color: string
    public lineWidth: number
    public radius: number
    public seq: number
    public x: number
    public y: number
    public xOffset: number
    public yOffset: number
    public firstOfSequence: boolean // premier point après positionnement du stylo

    constructor(p:IPoint = null) {
        this.color = '#ff0000'
        this.lineWidth = 1
        this.radius = 1
        this.seq = 0
        this.xOffset = 0
        this.yOffset = 0
        this.firstOfSequence = false

        if (p) {
            this.x = p.x
            this.y = p.y
        }
    }
}

export class Dimensions {
    public squareSize: number
    public scaleFactor: number
    public lineWidth: number
    public outterCircleRadius: number
    public circleColor: string
    public innerCircleColor: string
    public innerCircleRadius: number

    constructor() {
        const init = Math.min(window.innerHeight, window.innerWidth) - 20;
        this.squareSize = init
        this.scaleFactor = 1
        this.lineWidth = 2
        this.outterCircleRadius = Math.round((init)/2) - 10
        this.circleColor = '#325FA2'
        this.innerCircleColor = '#995FA2'
        this.innerCircleRadius = Math.round(this.outterCircleRadius / 5)
    }
}
