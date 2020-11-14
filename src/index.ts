import { Spirograph } from "./Spirograph";

export const bind = (window: any) => {
    const spirograph = new Spirograph(window)
    spirograph.link()

    if (window.pottingWheelPrms) {
        document.getElementById('angular-speed').value = Math.round(window.pottingWheelPrms.angularSpeed * 100);
        document.getElementById('color').value = window.pottingWheelPrms.point.color;
        document.getElementById('lineWidth').value = window.pottingWheelPrms.point.lineWidth;
        document.getElementById('radius').value = window.pottingWheelPrms.point.radius;

        document.getElementById('angular-speed')
            .addEventListener('change', (event) => {
                window.pottingWheelPrms.angularSpeed = event.target.value / 100;
            });
        mapPointOption('color', 'color');
        mapPointOption('radius', 'radius');
        mapPointOption('lineWidth', 'lineWidth');

        mapAction('start', 'start');
        mapAction('stop', 'stop');
        mapAction('stop-circle', 'stopCircle');
        mapAction('clear', 'clear');
        mapAction('undo', 'undo');

        function mapAction(idHtml: string, actionName: string) {
            document.getElementById(idHtml)
                .addEventListener('click', (event) => {
                    window.pottingWheelPrms[actionName]();
                });
        }

        function mapPointOption(idHtml: string, optionName: string) {
            document.getElementById(idHtml)
                .addEventListener('change', (event) => {
                    window.pottingWheelPrms.point[optionName] = event.target.value;
                });
        }
    }
}

bind(window);
