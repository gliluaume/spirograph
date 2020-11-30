import { Dot } from "./Parameters"

export class Path {
    public sequenceId: number
    public color: string
    public lineWidth: number
    public dots: Dot[]


    constructor(dot?: Dot) {
        this.color = dot.color
        this.lineWidth = dot.lineWidth
        this.sequenceId = dot.seq
        this.dots = [dot]
    }

    public matchDot(dot: Dot): boolean {
        return this.color === dot.color
            && this.lineWidth === dot.lineWidth
            && this.sequenceId === dot.seq
    }

    public toSvg(doc: HTMLDocument): HTMLElement {
        const path = this.dots.reduce((p, dot, index) => {
            let asString = ''
            if (index === 0) {
                asString = `M ${dot.x},${dot.y}`
            } else {
                asString = `L ${dot.x},${dot.y}`
            }
            p.push(asString)
            return p
        }, [])

        const elt = doc.createElement('path')
        elt.setAttribute('stroke', this.color)
        elt.setAttribute('fill', 'none')
        elt.setAttribute('d', path.join(' '))

        return elt
    }
}
