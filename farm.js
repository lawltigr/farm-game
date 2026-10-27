const state = {
    coins: 0,
    plots: [null, null, null, null, null, null, null, null, null, null, null, null]
};
const fieldEl = document.getElementById('field');
const GROW_TIME = 10;

function timeLeft(plot){
    const passed = (Date.now() - plot.plantedAt) / 1000;
    return GROW_TIME - passed;
}

function render(){
    fieldEl.innerHTML = ``;
    state.plots.forEach((plot, i) =>{
        const el = document.createElement('div');
        const plant = document.createElement('div');
        const timer = document.createElement('small');
        el.className = 'plot';
        timer.className = 'timer';
        plant.className = 'plant';

        if (plot){
            const left = timeLeft(plot);

            if (left <= 0) {
                plant.textContent = '🌾';
                el.classList.add('ready');
            } else{
                plant.textContent = left > GROW_TIME / 2 ? '🌱' : '🌿';
                timer.textContent = Math.ceil(left) + "s";
                el.title = Math.ceil(left) + "s Left";
            }
        }
        el.appendChild(plant);
        if (timer.textContent) el.appendChild(timer);
        el.onclick = () => tapPlot(i);
        fieldEl.appendChild(el);
    });
}

function tapPlot(i){
    const plot = state.plots[i];
    if (!plot){
        state.plots[i] = { plantedAt: Date.now() };
    } else if (timeLeft(plot) <= 0){
        state.plots[i] = null;
        state.coins += 2;
    }
    render();
}


setInterval(render, 1000);