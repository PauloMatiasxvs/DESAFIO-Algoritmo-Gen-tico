class Besouro {
    constructor() {
        this.R = Math.floor(Math.random() * 256);
        this.G = Math.floor(Math.random() * 256);
        this.B = Math.floor(Math.random() * 256);
    }

    get fitness() {
        return 765 - (this.R + this.G + this.B);
    }

    get color() {
        return `rgb(${this.R},${this.G},${this.B})`;
    }
}

let population = [];
let isEvolving = false;
let chart;
let generationCount = 0;
const chartData = {
    labels: [],
    datasets: [
        { label: 'Melhor Fitness', data: [], borderColor: '#4CAF50', fill: false },
        { label: 'Média Fitness', data: [], borderColor: '#2196F3', fill: false },
        { label: 'Pior Fitness', data: [], borderColor: '#f44336', fill: false }
    ]
};

function initChart() {
    const ctx = document.getElementById('evolutionChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function createPopulation(size) {
    return Array.from({ length: size }, () => new Besouro());
}

function updatePopulationDisplay() {
    const container = document.getElementById('populationContainer');
    container.innerHTML = '';
    
    population.forEach(besouro => {
        const div = document.createElement('div');
        div.className = 'besouro';
        div.style.backgroundColor = besouro.color;
        div.title = `RGB: (${besouro.R}, ${besouro.G}, ${besouro.B})\nFitness: ${besouro.fitness}`;
        container.appendChild(div);
    });
}

function selection(population) {
    const totalFitness = population.reduce((sum, b) => sum + b.fitness, 0);
    const probabilities = population.map(b => b.fitness / totalFitness);
    
    const parents = [];
    for (let i = 0; i < 2; i++) {
        let rand = Math.random();
        let sum = 0;
        for (let j = 0; j < population.length; j++) {
            sum += probabilities[j];
            if (sum >= rand) {
                parents.push(population[j]);
                break;
            }
        }
    }
    return parents;
}

const crossover = {
    umPonto: (p1, p2) => {
        const point = Math.random() < 0.5 ? 'R' : 'G';
        return new Besouro(
            point === 'R' ? p1.R : p2.R,
            point === 'G' ? p1.G : p2.G,
            p2.B
        );
    },
    uniforme: (p1, p2) => {
        return new Besouro(
            Math.random() < 0.5 ? p1.R : p2.R,
            Math.random() < 0.5 ? p1.G : p2.G,
            Math.random() < 0.5 ? p1.B : p2.B
        );
    },
    aritmetico: (p1, p2) => {
        return new Besouro(
            Math.round((p1.R + p2.R) / 2),
            Math.round((p1.G + p2.G) / 2),
            Math.round((p1.B + p2.B) / 2)
        );
    }
};

const mutation = {
    aleatoria: (child) => {
        const channel = ['R', 'G', 'B'][Math.floor(Math.random() * 3)];
        child[channel] = Math.floor(Math.random() * 256);
        return child;
    },
    pequena: (child) => {
        const channel = ['R', 'G', 'B'][Math.floor(Math.random() * 3)];
        child[channel] = Math.max(0, Math.min(255, child[channel] + Math.floor(Math.random() * 21 - 10)));
        return child;
    },
    dirigida: (child) => {
        child.R = Math.max(0, child.R - Math.floor(Math.random() * 16 + 5));
        child.G = Math.max(0, child.G - Math.floor(Math.random() * 16 + 5));
        child.B = Math.max(0, child.B - Math.floor(Math.random() * 16 + 5));
        return child;
    }
};

async function evolve() {
    const generations = parseInt(document.getElementById('generations').value);
    const mutationRate = parseFloat(document.getElementById('mutationRate').value);
    const crossoverType = document.getElementById('crossoverType').value;
    const mutationType = document.getElementById('mutationType').value;

    for (let i = 0; i < generations && isEvolving; i++) {
        generationCount++;
        const newPopulation = [];
        
        while (newPopulation.length < population.length) {
            const parents = selection(population);
            const child = crossover[crossoverType](parents[0], parents[1]);
            
            if (Math.random() < mutationRate) {
                mutation[mutationType](child);
            }
            
            newPopulation.push(child);
        }

        population = newPopulation.sort((a, b) => b.fitness - a.fitness);
        
        // Update chart
        const fitnessValues = population.map(b => b.fitness);
        chartData.labels.push(generationCount);
        chartData.datasets[0].data.push(Math.max(...fitnessValues));
        chartData.datasets[1].data.push(fitnessValues.reduce((a, b) => a + b, 0) / fitnessValues.length);
        chartData.datasets[2].data.push(Math.min(...fitnessValues));
        chart.update();
        
        updatePopulationDisplay();
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    isEvolving = false;
    document.getElementById('startBtn').textContent = 'Iniciar Evolução';
}

function startEvolution() {
    if (!isEvolving) {
        isEvolving = true;
        document.getElementById('startBtn').textContent = 'Parar';
        population = createPopulation(parseInt(document.getElementById('popSize').value));
        evolve();
    } else {
        isEvolving = false;
        document.getElementById('startBtn').textContent = 'Iniciar Evolução';
    }
}

// Event listeners
document.getElementById('popSize').addEventListener('input', function() {
    document.getElementById('popSizeValue').textContent = this.value;
});

document.getElementById('mutationRate').addEventListener('input', function() {
    document.getElementById('mutationRateValue').textContent = this.value;
});

document.getElementById('generations').addEventListener('input', function() {
    document.getElementById('generationsValue').textContent = this.value;
});

document.getElementById('startBtn').addEventListener('click', startEvolution);
document.getElementById('resetBtn').addEventListener('click', () => location.reload());

// Initialize
initChart();
updatePopulationDisplay();