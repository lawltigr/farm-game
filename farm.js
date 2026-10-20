const state = {
    plots: [null, null, null, null, null, null, null, null, null, null, null, null]
};
const fieldEl = document.getElementById('field');

function render(){
    fieldEl.innerHTML = '';
    state.plots.forEach((plot, i) =>{
        const el = document.createElement('div');
        el.className = 'plot';
        el.textContent = plot ? '🌱' : '';
        el.onclick = () => tapPlot(i);
        fieldEl.appendChild(el);
    });
}

function tapPlot(i){
    state.plots[i] = state.plots[i] ? null : { planted: true};
    render();
}

render();