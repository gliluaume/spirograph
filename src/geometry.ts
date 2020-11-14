export interface IPoint {
    x: number
    y: number
}

export interface ICircle {
    center: IPoint
    radius: number
}

export const rotatePoint = (p: IPoint, alpha: number) => ({
    x: p.x * Math.cos(alpha) - p.y * Math.sin(alpha),
    y: p.x * Math.sin(alpha) + p.y * Math.cos(alpha)
})

export const identity = (x: any) => x

/** Function composition */
export const o = (...fns: Function[]) =>
    fns.reduce(
        (composition, f) => (x: any) => composition(f(x)),
        identity)

export const oppPoint = (p: IPoint) => ({
    x: -p.x,
    y: -p.y,
})

export const translatePoint = (p: IPoint, q: IPoint) => ({
    x: p.x + q.x,
    y: p.y + q.y,
})

export const isInCircle = (p: IPoint, c: ICircle) => {
    var translated = translatePoint(p, oppPoint(c.center));
    return (Math.pow(translated.x, 2) + Math.pow(translated.y, 2) < Math.pow(c.radius, 2));
}
