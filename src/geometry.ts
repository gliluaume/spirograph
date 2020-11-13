export interface IPoint {
    x: number
    y: number
}

export const rotatePoint = (p: IPoint, alpha: number) => ({
    x: p.x * Math.cos(alpha) - p.y * Math.sin(alpha),
    y: p.x * Math.sin(alpha) + p.y * Math.cos(alpha)
})

export const oppPoint = (p: IPoint) => ({
    x: -p.x,
    y: -p.y,
})

export const translatePoint = (p: IPoint, q: IPoint) => ({
    x: p.x + q.x,
    y: p.y + q.y,
})
