const state = {
    coins: 20,
    selected: 'carrot',
    items: {},
    capacity: 10,
    plots: [null, null, null, null, null, null, null, null, null, null, null, null]
};
const fieldEl = document.getElementById('field');
const CROPS = {
    wheat: { name: 'Wheat', emoji: '🌾', time: 10, price: 2, seedCost: 1 },
    corn: { name: "Corn", emoji: '🌽', time: 20, price: 5, seedCost: 2 },
    carrot: { name: 'Carrot', emoji: '🥕', time: 30, price: 8, seedCost: 3 },
};

function selectSeed(key){
    state.selected = key;
    render();
}

function stored(){
    return Object.values(state.items).reduce((a,b) => a+b, 0);
}

function addItem(key){
    if(stored()>=state.capacity) return false;
    state.items[key] = (state.items[key] || 0) + 1;
    return true;
}

function timeLeft(plot){
    const crop = CROPS[plot.crop]; 
    return crop.time - (Date.now() - plot.plantedAt) / 1000;
}

function render(){
    document.getElementById('seeds').innerHTML = Object.entries(CROPS).map(([key, c]) =>
    `
        <div class="seed ${state.selected === key ? 'sel' : ''}" onclick="selectSeed('${key}')">
            ${c.emoji} ${c.name} <br>
            <small>${c.seedCost}🪙 ; ${c.time}s</small>
        </div>
    `).join('');
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
        const crop = CROPS[state.selected];
        if (state.coins < crop.seedCost) return;
        state.coins -= crop.seedCost;
        state.plots[i] = { crop: state.selected, plantedAt: Date.now() };
    } else if (timeLeft(plot) <= 0){
        state.plots[i] = null;
        state.coins += CROPS[plot.crop].price;
    }
    render();
}


setInterval(render, 1000);