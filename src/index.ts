import { IWindowWithSpirograph, Spirograph } from "./Spirograph";
import { get, set } from 'lodash'

export const bind = (win: Window) => {
    const spirograph = new Spirograph(win)
    spirograph.createLayers()
    spirograph.link()
    const window = win as IWindowWithSpirograph

    if (window.spirographParameters) {

        const angularSpeedElt = document.getElementById('angular-speed') as HTMLInputElement
        angularSpeedElt.value = window.spirographParameters.angularSpeed.toString()
        angularSpeedElt.addEventListener('change', (event: any) => {
            window.spirographParameters.angularSpeed = event.target.value / 100;
        });

        mapInput('color', 'point.color')
        mapInput('lineWidth', 'point.lineWidth')
        mapInput('radius', 'fixedCircleRadius')

        function mapInput(idHtml: string, property: string) {
            const inputElt = document.getElementById(idHtml) as HTMLInputElement
            inputElt.value = get(window.spirographParameters, property)
            console.log(property, get(window.spirographParameters, property))
            inputElt.addEventListener('change', (event: any) => {
                set(window.spirographParameters, property, event.target.value)
            });
        }

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
    }
}

bind(window);
