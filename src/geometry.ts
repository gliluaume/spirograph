export interface IPoint {
    x: number
    y: number
}

export interface ICircle {
    center: IPoint
    radius: number
}

export const rotatePoint = (p: IPoint, alpha: number): IPoint => ({
    x: p.x * Math.cos(alpha) - p.y * Math.sin(alpha),
    y: p.x * Math.sin(alpha) + p.y * Math.cos(alpha)
})

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const identity = (x: any): any => x

/** Function composition */
// eslint-disable-next-line @typescript-eslint/ban-types
export const o = (...fns: Function[]): Function =>
    fns.reduce(
        (composition, f) => (x: any) => composition(f(x)),
        identity)

export const eq = (a: IPoint, b: IPoint): boolean => {
    const delta = 1
    return (Math.abs(a.x - b.x) < delta) && (Math.abs(a.y - b.y) < delta)
}
export const oppPoint = (p: IPoint): IPoint => ({
    x: -p.x,
    y: -p.y,
})

export const translatePoint = (p: IPoint, q: IPoint): IPoint => ({
    x: p.x + q.x,
    y: p.y + q.y,
})

export const isInCircle = (p: IPoint, c: ICircle): boolean => {
    const translated = translatePoint(p, oppPoint(c.center));
    return (Math.pow(translated.x, 2) + Math.pow(translated.y, 2) < Math.pow(c.radius, 2));
}
