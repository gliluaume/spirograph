import { Gear } from "./Gear";
// const truc = document.createElement('svg')
const gear = new Gear();

render();

document.querySelector("#teeth").value = gear.teeth;
document.querySelector("#teeth").addEventListener("change", (e) => {
  gear.teeth = e.target.value;
  render();
});

document.querySelector("#teethHeight").value = gear.teethHeight;
document.querySelector("#teethHeight").addEventListener("change", (e) => {
  gear.teethHeight = e.target.value;
  render();
});

document.querySelector("#teethAngle").value = gear.teethAngle;
document.querySelector("#teethAngle").addEventListener("change", (e) => {
  gear.teethAngle = e.target.value;
  render();
});

document.querySelector("#flatteningRate").value = gear.flatteningRate;
document.querySelector("#flatteningRate").addEventListener("change", (e) => {
  gear.flatteningRate = e.target.value;
  render();
});

function render() {
  document.querySelector("#container").innerHTML = "";
  document.querySelector("#container").appendChild(gear.svg());
  document.querySelector("#radius").innerHTML = '' + gear.radius;
}
