const SAVE_KEY = 'farm_save_v1';
function defaultState() {
    return{
        coins: 20,
        xp: 0,
        selected: 'wheat',
        items: {},
        capacity: 10,
        orders: [],
        coop: {status: 'empty', at: 0},
        plots: [null, null, null, null, null, null, null, null, null, null, null, null]
    }
};
function load(){
    try{
        const raw = localStorage.getItem(SAVE_KEY);
        if (raw) return {...defaultState(), ...JSON.parse(raw)};
    }
    catch (e){
        console.warn('Save is broken, starting fresh', e);
    }
    return defaultState();
}
document.getElementById('reset').onclick = () => {
    if (confirm('Delete all progress?')){
        resetting = true;
        localStorage.removeItem(SAVE_KEY);
        location.reload();
    }
};
const state = load();
let resetting = false;
function save(){
    if(resetting){
        return;
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(state));
        } catch (e){
            console.warn('Cannot save', e);
        }
    }
}
const COOP_TIME = 20;
const COOP_FEED = 'wheat';
const fieldEl = document.getElementById('field');
const CROPS = {
    wheat: { name: 'Wheat', emoji: '🌾', time: 10, price: 2, seedCost: 1, lvl: 1, xp: 1 },
    corn: { name: "Corn", emoji: '🌽', time: 20, price: 5, seedCost: 2, lvl: 2, xp: 3 },
    carrot: { name: 'Carrot', emoji: '🥕', time: 30, price: 8, seedCost: 3, lvl: 3, xp: 5 },
};

const GOODS = {
    ...CROPS,
    egg: { name: 'Egg', emoji: '🥚', price: 6 }
};

function takeItem(key, n){
    state.items[key] = (state.items[key] || 0) - n;
    if (state.items[key] <= 0) delete state.items[key];
}

function coopLeft(){
    return COOP_TIME - (Date.now() - state.coop.at) / 1000;
}

function tapCoop(){
    const c = state.coop;
    if (c.status === 'empty'){
        if((state.items[COOP_FEED] || 0) < 1){
            showMSG('Need ' + GOODS[COOP_FEED].emoji + ' to feed');
            return;
        }
        takeItem(COOP_FEED, 1);
        c.status = 'laying';
        c.at = Date.now();
    }
    else if (c.status === 'laying' && coopLeft() <= 0){
        if (addItem('egg')){
            addXp(2);
            c.status = 'empty';
        }
    }
    render();
}

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

function genOrder(){
    const pool = Object.keys(CROPS).filter(k=> CROPS[k].lvl <= level());
    if (level() >= 2) pool.push('egg');
    const need = {};
    const kinds = 1 + Math.floor(Math.random()*2);
    for (let j = 0; j < kinds; j++){
        const key = pool[Math.floor(Math.random()*pool.length)];
        need[key] = (need[key] || 0) + 1 + Math.floor(Math.random()*3);
    }
    let value = 0, qty = 0;
    for (const key in need){
        value += GOODS[key].price * need[key];
        qty += need[key];
    }
    return {need, coins: Math.ceil(value * 1.4), xp: qty * 2};
}

function ensureOrders(){
    while (state.orders.length < 3) state.orders.push(genOrder());
}

function addXp(n){
    const before = level();
    state.xp += n;
    if (level() > before) showMSG('🎉 Level ' + level() + '!');
}

function canDeliver(o){
    return Object.keys(o.need).every(k => (state.items[k] || 0) >= o.need[k]);
}

function delivery(i){
    const o = state.orders[i];
    if (!canDeliver(o)) return;
    for (const key in o.need){
        state.items[key] -= o.need[key];
        if (state.items[key] <= 0) delete state.items[key];
    }
    state.coins += o.coins;
    addXp(o.xp);
    state.orders[i] = genOrder();
    render();
}

function sell(key, all){
    const n = all ? state.items[key] : 1;
    takeItem(key, n);
    state.coins += GOODS[key].price * n;
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
        <div class="seed ${state.selected === key ? 'sel' : ''} ${locked ? 'lock': ''}" onclick="selectSeed('${key}')">
            ${locked ? '🔒' : c.emoji} ${c.name} <br>
            <small>${locked ? 'Level ' + c.lvl : c.seedCost + '🪙 ;' + c.time + 's'}</small>
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

    const ordersEl = document.getElementById('orders');
    ordersEl.innerHTML = '';
    state.orders.forEach((o,i) => {
        const box = document.createElement('div');
        box.className = 'order';
        const need = Object.entries(o.need).map(([k,n]) => GOODS[k].emoji + ' ' + (state.items[k] || 0) + '/' + n).join(' ');
        box.textContent = need + ' --> +' + o.coins + '🪙 +' + o.xp + '⭐️';
        const btn = document.createElement('button');
        btn.textContent = 'Deliver';
        btn.disabled = !canDeliver(o);
        btn.onpointerdown = () => delivery(i);
        box.appendChild(btn);
        ordersEl.appendChild(box);
    })

    const coopEl = document.getElementById('coop');
    coopEl.innerHTML = '';
    const c = state.coop;
    const btn = document.createElement('button');
    let label;
    if(c.status === 'empty'){
        label = 'Feed (1 ' + GOODS[COOP_FEED].emoji + ')';
    } else if(coopLeft()> 0){
        label = '🐔 Laying...' + Math.ceil(coopLeft()) + 's';
        btn.disabled = true;
    } else{
        label = '🥚 Collect egg';
    }
    btn.textContent = label;
    btn.onpointerdown = tapCoop;
    coopEl.appendChild(btn);

    keys.forEach(key => {
        const c = GOODS[key];
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
    save();
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
            addXp(CROPS[plot.crop].xp);
            state.plots[i] = null;
        }
    }
    render();
}

function showMSG(text){
    const el = document.getElementById('msg');
    el.textContent = text;
    setTimeout(() => el.textContent = '', 2500);
}

ensureOrders();
render();
const readyCount = state.plots.filter(p => p && timeLeft(p) <= 0).length;
if (readyCount > 0) showMSG('🌾 ' + readyCount + ' crops are ready!');
setInterval(render, 1000);