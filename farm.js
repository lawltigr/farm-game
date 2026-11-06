const state = {
    coins: 20,
    xp: 0,
    selected: 'carrot',
    items: {},
    capacity: 10,
    plots: [null, null, null, null, null, null, null, null, null, null, null, null]
};
const fieldEl = document.getElementById('field');
const CROPS = {
    wheat: { name: 'Wheat', emoji: '🌾', time: 10, price: 2, seedCost: 1, lvl: 1, xp: 1 },
    corn: { name: "Corn", emoji: '🌽', time: 20, price: 5, seedCost: 2, lvl: 2, xp: 3 },
    carrot: { name: 'Carrot', emoji: '🥕', time: 30, price: 8, seedCost: 3, lvl: 3, xp: 5 },
};

function selectSeed(key){
    if (CROPS[key].lvl > level()) return;
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

function level(){
    return Math.floor(Math.sqrt(state.xp / 8)) + 1;
}

function sell(key, all){
    const n = all ? state.items[key] : 1;
    state.items[key] -= n;
    if (state.items[key] <= 0) delete state.items[key];
    state.coins += CROPS[key].price * n;
    render();
}

function timeLeft(plot){
    const crop = CROPS[plot.crop]; 
    return crop.time - (Date.now() - plot.plantedAt) / 1000;
}

function render(){
    document.getElementById('seeds').innerHTML = Object.entries(CROPS).map(([key, c]) =>{
        const locked = c.lvl > level();
        return `
        <div class="seed ${state.selected === key ? 'sel' : ''}" onclick="selectSeed('${key}')">
            ${c.emoji} ${c.name} <br>
            <small>${c.seedCost}🪙 ; ${c.time}s</small>
        </div>
    `}).join('');
    document.getElementById('coins').textContent = state.coins;
    document.getElementById('barn').textContent = stored() + ' / ' + state.capacity;
    document.getElementById('lvl').textContent = level();
    document.getElementById('xp').textContent = state.xp;
    const itemsEl = document.getElementById('items');
    itemsEl.innerHTML = '';
    const keys = Object.keys(state.items);
    if (keys.length === 0){
        itemsEl.textContent = "Barn is empty";
    }

    keys.forEach(key => {
        const c = CROPS[key];
        const row = document.createElement('div');
        row.textContent = c.emoji + ' ' + c.name + ' x' + state.items[key] + ' ';
        const one = document.createElement('button');
        one.textContent = 'Sell 1 (' + c.price + '🪙)';
        one.onpointerdown = () => sell(key, false);
        const all = document.createElement('button');
        all.textContent = 'Sell all';
        all.onpointerdown = () => sell(key, true);
        row.appendChild(one);
        row.appendChild(all);
        itemsEl.appendChild(row);
    })
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
        if (crop.lvl > level()) return;
        if (state.coins < crop.seedCost) return;
        state.coins -= crop.seedCost;
        state.plots[i] = { crop: state.selected, plantedAt: Date.now() };
    } else if (timeLeft(plot) <= 0){
        // state.plots[i] = null;
        // state.coins += CROPS[plot.crop].price;
        if (addItem(plot.crop)){
            const before = level();
            state.xp + CROPS[plot.crop].xp;
            if(level()> before){
                showMSG('🎉 Level ' + level() + '!');
            }
            state.plots[i] = null;
        }
    }
    render();
}

function showMsg(text){
    const el = document.getElementById('msg');
    el.textContent = text;
    setTimeout(() => el.textContent = '', 2500);
}

setInterval(render, 1000);