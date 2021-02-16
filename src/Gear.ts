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
    public center: IPoint
    public teeth
    public teethHeight
    public teethAngle
    public borders: Borders
    public flattening

    constructor() {
        this.teeth = 48
        this.center = { x: 0, y: 0 }

        // Angle du sommet de la dent. La dent est un triangle isocèle
        this.teethAngle = Math.PI / 2
        this.teethHeight = 4
        this.radius = 0
        this.flattening = 1
    }

    /*
        A tooth looks like this: TODO: (a-b doit être tangente à un cercle inscrit, pas horizontal)
              b ___ c                                                          /\
               /   \        Flattening c'est ce qui décrit la zone plate      /  \
              /     \ d     en comparaison avec le triangle suivant :        /    \
         ____/ a     \____                                                  /      \
                                                                           /        \
    */
    public calc(): IPoint[] {
        // on calcule un polygone régulier dont le nombre de côtés est this.teeth et la longueur du côté est edgeLength
        const edgeLength = 2 * Math.tan(this.teethAngle / 2) * this.teethHeight
        // angle du triangle formé par le centre du polygone, et les deux points de la base de la dent de la roue (An et An+1)
        const innerAngle = 2 * Math.PI / this.teeth
        // rayon du cercle qui passe par tous les points de la base des dents (les Ai)
        // C'est aussi la longueur du côté du triangle décrit précédemment
        this.radius = (edgeLength / 2) / Math.sin(innerAngle / 2)
        const points = []
        // Pour avoir le premier côté horizontal, on fait tourner le premier point vers la gauche
        // Ainsi, le sommet de la dent se trouve en x = 0
        const firstPoint = rotatePoint({ x: 0, y: this.radius }, innerAngle / 2)
        const toothApex = { x: 0, y: this.radius + this.teethHeight}
        if (this.flattening <= 0) {
            for (let i = 0; i < this.teeth; i++) {
                points.push(rotatePoint(firstPoint, -innerAngle * i))
                points.push(rotatePoint(toothApex, -innerAngle * i))
            }
        } else {
            const a = { x: firstPoint.x + this.flattening, y: firstPoint.y - this.flattening }
            const b = { x: toothApex.x - this.flattening/2, y: toothApex.y + this.flattening }
            const c = { x: toothApex.x + this.flattening/2, y: toothApex.y + this.flattening }
            let d = rotatePoint(firstPoint, -innerAngle)
            d = { x: d.x - this.flattening, y: d.y - this.flattening,}
            for (let i = 0; i < this.teeth; i++) {
                points.push(rotatePoint(a, -innerAngle * i))
                points.push(rotatePoint(b, -innerAngle * i))
                points.push(rotatePoint(c, -innerAngle * i))
                points.push(rotatePoint(d, -innerAngle * i))
            }
        }

        points.push(points[0])

        this.center = translatePoint(this.center, { x: 4 * this.radius, y: 4 * this.radius })
        return points.map(
            p => translatePoint(p, { x: 4 * this.radius, y: 4 * this.radius })
        )
    }

    private pointsToPath(points: IPoint[]): string {
        this.borders = new Borders(points)
        return points.map(
            (point, index) => {
                return (index === 0)
                ? `M ${point.x},${point.y}`
                : `L ${point.x},${point.y}`
            }).join(' ')
    }

    // PB: centrer la roue (le centre de la roue doit être fonction de sa taille)
    public svg(): SVGElement {
        // TODO cleanly implement colors
        // Fill https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Gradients
        const goldDarker = '#513d12';
        const goldDark = '#b38728';
        const goldMedium = '#bf953f';
        const goldLight = '#fcf6ba';

        const points = this.calc()
        const path = this.pointsToPath(points)

        const ns = 'http://www.w3.org/2000/svg'
        const s = document.createElementNS(ns, 'svg')
        s.setAttribute('viewBox', this.borders.asString())
        s.setAttribute('style', this.borders.asStyle())

        const p = document.createElementNS(ns, 'path')

        p.setAttribute('fill', goldMedium)
        p.setAttribute('stroke', goldMedium )
        p.setAttribute('stroke-width', '1px')
        p.setAttribute('d', path)

        const largeCircle = document.createElementNS(ns, 'circle')
        largeCircle.setAttribute('cx', this.center.x.toString())
        largeCircle.setAttribute('cy', this.center.y.toString())
        largeCircle.setAttribute('r', (this.radius - 6).toString())
        largeCircle.setAttribute('fill', goldDarker)

        const smallCircle = document.createElementNS(ns, 'circle')
        smallCircle.setAttribute('cx', this.center.x.toString())
        smallCircle.setAttribute('cy', this.center.y.toString())
        smallCircle.setAttribute('r', (this.radius * 0.3 - 6).toString())
        smallCircle.setAttribute('fill', goldMedium)

        const axis = document.createElementNS(ns, 'circle')
        axis.setAttribute('cx', this.center.x.toString())
        axis.setAttribute('cy', this.center.y.toString())
        axis.setAttribute('r', '6')
        axis.setAttribute('fill', 'white')

        s.appendChild(p)
        s.appendChild(largeCircle)
        s.appendChild(smallCircle)
        s.appendChild(axis)
        return s
    }
}
