const state = {
    coins: 0,
    selected: 'carrot',
    plots: [null, null, null, null, null, null, null, null, null, null, null, null]
};
const fieldEl = document.getElementById('field');
const CROPS = {
    wheat: { name: 'Wheat', emoji: '🌾', time: 10, price: 2 },
    corn: { name: "Corn", emoji: '🌽', time: 20, price: 5 },
    carrot: { name: 'Carrot', emoji: '🥕', time: 30, price: 8 },
};

function timeLeft(plot){
    const crop = CROPS[plot.crop]; 
    return crop.time - (Date.now() - plot.plantedAt) / 1000;
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
                plant.textContent = CROPS[plot.crop].emoji;
                el.classList.add('ready');
            } else{
                plant.textContent = left > CROPS[plot.crop].time / 2 ? '🌱' : '🌿';
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
        state.plots[i] = { crop: state.selected, plantedAt: Date.now() };
    } else if (timeLeft(plot) <= 0){
        state.plots[i] = null;
        state.coins += CROPS[plot.crop].price;
    }
    render();
}


setInterval(render, 1000);