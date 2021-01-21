import { IPoint, rotatePoint, translatePoint } from "./geometry"

class Borders {
    public padding: number
    public maxX: number
    public minX: number
    public maxY: number
    public minY: number

    constructor(points: IPoint[], padding = 5) {
        this.padding = padding
        this.maxX = this.max(points, p => p.x)
        this.minX = this.min(points, p => p.x)
        this.maxY = this.max(points, p => p.y)
        this.minY = this.min(points, p => p.y)
    }

    public asString(): string {
        return `${this.minX - this.padding} ${this.minY - this.padding}` + ' ' +
            `${this.maxX + this.padding} ${this.maxY + this.padding}`
    }

    public asStyle(): string {
        return `height: ${Math.round(this.maxY + this.padding)}px; width: ${Math.round(this.maxX + this.padding)}px;`
    }

    private max(arr: any[], accessor: (a: any) => number) {
        return Math.max.apply(null, arr.map(accessor))
    }

    private min(arr: any[], accessor: (a: any) => number) {
        return Math.min.apply(null, arr.map(accessor))
    }
}

export class Gear {
    public radius
    public teeth
    public teethHeight
    public teethAngle
    public borders: Borders

    constructor() {
        this.teeth = 20
        this.teethAngle = Math.PI / 4
        this.teethHeight = 10
        this.radius = 0
    }

    public calc(): IPoint[] {
        // on calcule un polygone régulier dont le nombre de côtés est this.teeth et la longueur du côté est edgeLength
        const edgeLength = 2 * Math.sin(this.teethAngle) * this.teethHeight
        // angle du triangle formé par le centre du polygone, et les deux points de la base de la dent de la roue (An et An+1)
        const innerAngle = 2 * Math.PI / this.teeth
        // rayon du cercle qui passe par tous les points de la base des dents (les Ai)
        // C'est aussi la longueur du côté du triangle décrit précédemment
        this.radius = edgeLength / Math.sin(innerAngle)
        const points = []
        const firstPoint = { x: 0, y: this.radius }
        for (let i = 0; i < this.teeth; i++) {
            console.log(innerAngle * i)
            points.push(rotatePoint(firstPoint, innerAngle * i))
        }
        points.push(points[0])

        return points.map(
            p => translatePoint(p, { x: 4 * this.radius, y: 4 * this.radius })
        )
    }

    public pointsToPath(points: IPoint[]): string {
        this.borders = new Borders(points)
        console.log(this.borders)
        return points.map(
            (point, index) => {
                return (index === 0)
                ? `M ${point.x},${point.y}`
                : `L ${point.x},${point.y}`
            }).join(' ')
    }

    // PB: centrer la roue (le centre de la roue doit être fonction de sa taille)
    public svg(): SVGElement {
        const points = this.calc()
        const path = this.pointsToPath(points)
        console.log('path', path)
        const ns = 'http://www.w3.org/2000/svg'
        const s = document.createElementNS(ns, 'svg')
        s.setAttribute('viewBox', this.borders.asString())
        s.setAttribute('style', this.borders.asStyle())

        const p = document.createElementNS(ns, 'path')
        p.setAttribute('fill', 'none')
        p.setAttribute('stroke', 'red')
        p.setAttribute('stroke-width', '1px')
        p.setAttribute('d', path)

        s.appendChild(p)
        return s
    }
}
