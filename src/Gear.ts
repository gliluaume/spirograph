import { IPoint, rotatePoint, translatePoint } from "./geometry"

export class Gear {
    public radius
    public cx
    public cy
    public teeth
    public teethHeight
    public teethAngle

    constructor() {
        this.cx = 100
        this.cy = 100
        this.teeth = 4
        this.teethAngle = Math.PI / 4
        this.teethHeight = 40
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
        console.log('innerAngle', innerAngle, 'edgeLength', edgeLength, 'radius', this.radius)
        const points = []
        const firstPoint = { x: 0, y: this.radius }
        for (let i = 0; i < this.teeth; i++) {
            console.log(innerAngle * i)
            points.push(rotatePoint(firstPoint, innerAngle * i))
        }
        points.push(points[0])
        return points
    }

    public pointsToPath(points) {
        // console.log(points)
        // const first = points[0]
        // let str = `M ${first.x},${first.y}`;

        return points
        // .map(p => ({ x: Math.round(p.x), y: Math.round(p.y) }))
        .map(p => translatePoint(p, { x: this.cx, y: this.cy }))
        .map(
            (point, index) => {
                return (index === 0)
                ? `M ${point.x},${point.y}`
                : `L ${point.x},${point.y}`
            }).join(' ')
    }

    public svg() {
        const points = this.calc()
        const path = this.pointsToPath(points)
        console.log('path', path)
        const ns = 'http://www.w3.org/2000/svg'
        const s = document.createElementNS(ns, 'svg')
        s.setAttribute('viewBox', `0 0 ${2 * this.cx} ${2 * this.cy}`)

        const p = document.createElementNS(ns, 'path')
        p.setAttribute('fill', 'none')
        p.setAttribute('stroke', 'red')
        p.setAttribute('d', path)
        // p.setAttribute('d', `M 70,135.3197264742181 L 13.431457505076196,102.65986323710905 L 13.431457505076189,37.34013676289097 L 69.99999999999999,4.680273525781914 L 126.56854249492379,37.34013676289093 L 126.56854249492383,102.659863237109 L 70,135.3197264742181`)


        // p.setAttribute('d',
        //     `M 10,10
        //     L 90,90
        //     V 10
        //     H 50`)
        s.appendChild(p)
        return s
    }
}
