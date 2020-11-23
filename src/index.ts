import { IWindowWithSpirograph, Spirograph } from "./Spirograph";
import { get, set } from 'lodash'

interface ISpiroWin extends IWindowWithSpirograph {
    setRadius: (r: number) => void,
    radiusPreselect: RadiusPreSizes
}

interface RadiusPreSizes {
    XS: number
    S: number
    M: number
    L: number
}

type radiusSizes = keyof RadiusPreSizes

// interface IConvMap {
//     string: (v: any) => string
//     number: (v: any) => number
//     boolean: (v: any) => boolean
// }

// type inputType = keyof IConvMap;

// const convMap: IConvMap = {
//     string: (v: any) => v.toString(),
//     number: (v: any) => +v,
//     boolean: (v: any) => !!v,
// }

export const bind = (win: Window) => {
    const spirograph = new Spirograph(win)
    spirograph.createLayers()
    spirograph.link()
    const window = win as ISpiroWin

    if (window.spirographParameters) {

        const angularSpeedElt = document.getElementById('angular-speed') as HTMLInputElement
        angularSpeedElt.value = window.spirographParameters.angularSpeed.toString()
        angularSpeedElt.addEventListener('change', (event: any) => {
            window.spirographParameters.angularSpeed = event.target.value / 100;
        });

        mapInput('color', 'point.color')
        mapInput('lineWidth', 'point.lineWidth')
        mapInput('radius', 'mobileCircleRadius')

        function mapInput(idHtml: string, property: string) { //, type: inputType = 'string') {
            const inputElt = document.getElementById(idHtml) as HTMLInputElement
            inputElt.value = get(window.spirographParameters, property)
            console.log(property, get(window.spirographParameters, property))
            inputElt.addEventListener('change', (event: any) => {
                // const value = convMap[type](event.target.value)
                // set(window.spirographParameters, property, value)
                set(window.spirographParameters, property, event.target.value)
            });
        }
        console.log(window.spirographParameters.dimensions.outterCircleRadius)
        document.getElementById('radius')
            .setAttribute('max', window.spirographParameters.dimensions.innerCircleMaxRadius.toString())

        type actionTypes = 'start' | 'stop' | 'stopCircle' | 'clear' | 'undo' | 'save' | 'toggleGrid';
        mapAction('start', 'start');
        mapAction('stop', 'stop');
        mapAction('stop-circle', 'stopCircle');
        mapAction('clear', 'clear');
        mapAction('undo', 'undo');
        mapAction('save', 'save');
        mapAction('toggleGrid', 'toggleGrid');

        function mapAction(idHtml: string, actionName: actionTypes) {
            document.getElementById(idHtml)
                .addEventListener('click', (event) => {
                    window.spirographParameters[actionName]();
                });
        }

        window.radiusPreselect = {
            XS: 0.15,
            S: 0.25,
            M: 0.50,
            L: 0.75,
        }

        Object.keys(window.radiusPreselect).forEach((key: radiusSizes) => {
            document.getElementById(`size${key}`)
                .addEventListener('click', (event: any) => {
                    window.spirographParameters.mobileCircleRadius = Math.floor(
                        window.spirographParameters.dimensions.outterCircleRadius * window.radiusPreselect[key] as unknown as any)
                });
        })

        window.setRadius = (r: number) => {
            window.spirographParameters.mobileCircleRadius = r
        }
    }
}

bind(window);
