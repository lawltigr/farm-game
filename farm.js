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
        // const timer = document.createElement('small');
        el.className = 'plot';
        // timer.className = 'timer';
        el.innerHTML=`
        <div class="plant"></div>
        <small>timer</small>
        `;

        if (plot){
            const left = timeLeft(plot);

            if (left <= 0) {
                el.plant.textContent = '🌾';
                el.classList.add('ready');
            } else{
                el.plant.textContent = left > GROW_TIME / 2 ? '🌱' : '🌿';
                el.title = 'Time left ' + Math.ceil(left) + 's';
                // timer.textContent = Math.ceil(timeLeft(plot));
            }
        }
        el.onclick = () => tapPlot(i);
        fieldEl.appendChild(el);
        // fieldEl.appendChild(timer);
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