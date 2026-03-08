// Global variables
let currentLecture = 0;
let quizMode = '';
let currentQuestion = 0;
let score = 0;
let selectedAnswer = null;
let quizAnswered = false;
let apiQuestions = [];
let currentDifficulty = '';
let customQuizzes = [];
let currentCustomQuizId = null;
let currentCustomQuiz = null;

// Helper function to parse mathematical expressions
function parseExpression(str, vars) {
    str = str.replace(/\^/g, '**').replace(/√/g, 'sqrt');
    try {
        return Function(...Object.keys(vars), `return ${str}`)(...Object.values(vars));
    } catch (e) {
        console.error('Error parsing expression:', e);
        return 0;
    }
}

// Helper function to shuffle array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Enhanced Quiz Questions Database
const quizzes = {
    easy: [
        {
            question: "What is the SI unit of force?",
            options: ["Joule", "Newton", "Watt", "Pascal"],
            correct: 1
        },
        {
            question: "Which of Newton's laws states that every action has an equal and opposite reaction?",
            options: ["First Law", "Second Law", "Third Law", "Fourth Law"],
            correct: 2
        },
        {
            question: "What is the formula for kinetic energy?",
            options: ["mgh", "½mv²", "Fv", "ma"],
            correct: 1
        },
        {
            question: "What does 'g' represent in physics (on Earth)?",
            options: ["Gravitational acceleration (~9.8 m/s²)", "Gravitational force", "Weight", "Mass"],
            correct: 0
        },
        {
            question: "If an object is moving at constant velocity, what is its acceleration?",
            options: ["Positive", "Negative", "Zero", "Undefined"],
            correct: 2
        },
        {
            question: "What is a scalar quantity?",
            options: ["Force", "Velocity", "Mass", "Acceleration"],
            correct: 2
        },
        {
            question: "Which of the following has both magnitude and direction?",
            options: ["Speed", "Distance", "Displacement", "Time"],
            correct: 2
        },
        {
            question: "What is the SI unit of energy?",
            options: ["Erg", "Joule", "Calorie", "Newton"],
            correct: 1
        }
    ],
    medium: [
        {
            question: "A car accelerates from 0 to 60 m/s in 10 seconds. What is the acceleration?",
            options: ["4 m/s²", "5 m/s²", "6 m/s²", "10 m/s²"],
            correct: 2
        },
        {
            question: "What is the wavelength formula for waves?",
            options: ["v = f/λ", "λ = v/f", "f = λ/v", "v = λ × f"],
            correct: 1
        },
        {
            question: "In a vacuum, what is the speed of light (approximately)?",
            options: ["3 × 10⁶ m/s", "3 × 10⁷ m/s", "3 × 10⁸ m/s", "3 × 10⁹ m/s"],
            correct: 2
        },
        {
            question: "What is the angle of incidence equal to in the law of reflection?",
            options: ["Angle of refraction", "Angle of diffraction", "Angle of reflection", "Critical angle"],
            correct: 2
        },
        {
            question: "Which of the following is a vector quantity?",
            options: ["Speed", "Distance", "Displacement", "Temperature"],
            correct: 2
        },
        {
            question: "Faraday's law deals with which phenomenon?",
            options: ["Magnetism", "Electromagnetic Induction", "Electricity", "Gravity"],
            correct: 1
        },
        {
            question: "What is the relationship between frequency and wavelength?",
            options: ["Direct", "Inverse", "Exponential", "Logarithmic"],
            correct: 1
        },
        {
            question: "The refractive index of a medium is always?",
            options: ["Less than 1", "Equal to 1", "Greater than 1", "Can be any value"],
            correct: 2
        }
    ],
    hard: [
        {
            question: "An object is projected vertically upward with initial velocity 20 m/s. Max height reached is? (g=10 m/s²)",
            options: ["40 m", "30 m", "20 m", "10 m"],
            correct: 1
        },
        {
            question: "What is Planck's constant approximately equal to?",
            options: ["6.626 × 10⁻³⁴ Js", "6.626 × 10⁻³³ Js", "3.14 × 10⁻³⁴ Js", "2.718 × 10⁻³⁴ Js"],
            correct: 0
        },
        {
            question: "For a lens, if object distance is u = 30 cm and focal length f = 10 cm, find v using lens formula 1/f = 1/u + 1/v",
            options: ["15 cm", "12 cm", "20 cm", "30 cm"],
            correct: 0
        },
        {
            question: "Two resistors R₁ and R₂ are connected in series. What is the equivalent resistance?",
            options: ["R₁R₂/(R₁+R₂)", "R₁ + R₂", "√(R₁² + R₂²)", "R₁ - R₂"],
            correct: 1
        },
        {
            question: "What is the energy of a photon with frequency 5 × 10¹⁴ Hz? (h = 6.626 × 10⁻³⁴ Js)",
            options: ["3.313 × 10⁻¹⁹ J", "3.313 × 10⁻²⁰ J", "3.313 × 10⁻¹⁸ J", "3.313 × 10⁻²¹ J"],
            correct: 0
        },
        {
            question: "In electromagnetic induction, what is Lenz's law?",
            options: ["Induced current increases flux", "Induced current opposes change in flux", "Induced EMF is constant", "Flux is always zero"],
            correct: 1
        },
        {
            question: "The intensity of laser light is determined by?",
            options: ["Wavelength only", "Frequency only", "Power and area", "Coherence"],
            correct: 2
        },
        {
            question: "Snell's law relates to which phenomenon?",
            options: ["Reflection", "Refraction", "Diffraction", "Interference"],
            correct: 1
        }
    ]
};

// Tab Switching Functions
function switchGraphTab(tab) {
    const tabs = document.querySelectorAll('.graph-tab-content');
    const buttons = document.querySelectorAll('.graph-tab-btn');
    
    tabs.forEach(t => t.classList.remove('active'));
    buttons.forEach(b => b.classList.remove('active'));
    
    const tabId = tab === 'predefined' ? 'predefined-graphs' : 
                  tab === 'custom' ? 'custom-graphs' : 'point-graphs';
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
}

// Initialize Predefined Graphs
function initializeGraphs() {
    createMotionGraph();
    createVelocityGraph();
    createForceGraph();
    createEnergyChart();
}

// Motion Graph (Position vs Time)
function createMotionGraph() {
    const canvas = document.getElementById('motionChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    const timeData = [];
    const positionData = [];
    
    // Generate uniform motion data (s = ut, u = 10 m/s)
    for (let t = 0; t <= 10; t += 0.5) {
        timeData.push(t);
        positionData.push(t * 10); // s = 10*t
    }
    
    canvas.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeData,
            datasets: [{
                label: 'Position (s = 10t m)',
                data: positionData,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointRadius: 4,
                pointBackgroundColor: '#1e3a8a'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: true, position: 'top' },
                title: {
                    display: true,
                    text: 'Motion Graph: Position vs Time',
                    font: { size: 14, weight: 'bold' }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time (s)',
                        font: { size: 12, weight: 'bold' }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Position (m)',
                        font: { size: 12, weight: 'bold' }
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

// Velocity vs Time Graph
function createVelocityGraph() {
    const canvas = document.getElementById('velocityChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    const timeData = [];
    const velocityData = [];
    
    // Generate accelerated motion data (v = u + at, u = 5 m/s, a = 2 m/s²)
    for (let t = 0; t <= 10; t += 0.5) {
        timeData.push(t);
        velocityData.push(5 + 2 * t); // v = 5 + 2*t
    }
    
    canvas.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeData,
            datasets: [{
                label: 'Velocity (v = 5 + 2t m/s)',
                data: velocityData,
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointRadius: 4,
                pointBackgroundColor: '#d97706'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: true, position: 'top' },
                title: {
                    display: true,
                    text: 'Velocity Graph: Acceleration = 2 m/s²',
                    font: { size: 14, weight: 'bold' }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time (s)',
                        font: { size: 12, weight: 'bold' }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Velocity (m/s)',
                        font: { size: 12, weight: 'bold' }
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

// Force vs Acceleration Graph (F = ma)
function createForceGraph() {
    const canvas = document.getElementById('forceChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    const accelerationData = [];
    const forceData = [];
    
    // Generate F = ma data for mass = 10 kg
    const mass = 10;
    for (let a = 0; a <= 10; a += 1) {
        accelerationData.push(a);
        forceData.push(mass * a); // F = 10 * a
    }
    
    canvas.chart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: "Newton's Second Law (F = 10a N)",
                data: accelerationData.map((a, i) => ({x: a, y: forceData[i]})),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.6)',
                borderWidth: 2,
                pointRadius: 6,
                showLine: true,
                fill: false,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: true, position: 'top' },
                title: {
                    display: true,
                    text: "Newton's Second Law: F = ma (m = 10 kg)",
                    font: { size: 14, weight: 'bold' }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Acceleration (m/s²)',
                        font: { size: 12, weight: 'bold' }
                    },
                    beginAtZero: true
                },
                y: {
                    title: {
                        display: true,
                        text: 'Force (N)',
                        font: { size: 12, weight: 'bold' }
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

// Energy Distribution Chart
function createEnergyChart() {
    const canvas = document.getElementById('energyChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    canvas.chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Kinetic Energy', 'Potential Energy', 'Thermal Energy'],
            datasets: [{
                data: [40, 35, 25],
                backgroundColor: [
                    '#3b82f6',
                    '#10b981',
                    '#f59e0b'
                ],
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Energy Distribution in a System',
                    font: { size: 14, weight: 'bold' }
                }
            }
        }
    });
}

function switchModelsTab(tab) {
    const tabs = document.querySelectorAll('.models-tab-content');
    const buttons = document.querySelectorAll('.models-tab-btn');
    
    tabs.forEach(t => t.classList.remove('active'));
    buttons.forEach(b => b.classList.remove('active'));
    
    const tabId = tab === 'coordinates' ? 'coordinates-models' : 
                  tab === 'vectors' ? 'vectors-models' :
                  tab === 'projectile' ? 'projectile-models' :
                  tab === 'oscillation' ? 'oscillation-models' :
                  tab === 'em' ? 'em-models' :
                  tab === 'optics' ? 'optics-models' : 'advanced-models';
    
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
}

// Show/Hide Sections
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    
    document.getElementById(sectionId).classList.add('active');
    event.target.classList.add('active');
    
    if (sectionId === 'graphs') {
        setTimeout(() => {
            initializeGraphs();
        }, 100);
    }
}

// Custom 3D Graph Plotting Helper - Create axis labels
// Update UI based on graph type selection
function updateGraphTypeUI() {
    const graphType = document.querySelector('input[name="graphType"]:checked').value;
    const equationType = document.getElementById('equationType');
    
    if (graphType === '2d') {
        equationType.value = 'simple';
        equationType.disabled = true;
        document.getElementById('yMin').disabled = true;
        document.getElementById('yMax').disabled = true;
    } else {
        equationType.disabled = false;
        document.getElementById('yMin').disabled = false;
        document.getElementById('yMax').disabled = false;
    }
}

// Plot custom graph (2D or 3D)
function plotCustomGraph() {
    const graphType = document.querySelector('input[name="graphType"]:checked').value;
    
    if (graphType === '2d') {
        plot2DEquation();
    } else {
        plot3DEquation();
    }
}

// Plot 2D equation using Chart.js
function plot2DEquation() {
    const equation = document.getElementById('customEquation').value;
    const xMin = parseFloat(document.getElementById('xMin').value) || -10;
    const xMax = parseFloat(document.getElementById('xMax').value) || 10;
    
    if (!equation) {
        alert('Please enter an equation');
        return;
    }
    
    const data = [];
    const step = (xMax - xMin) / 100;
    
    for (let x = xMin; x <= xMax; x += step) {
        try {
            const y = parseExpression(equation, { 
                x, 
                sin: Math.sin, 
                cos: Math.cos, 
                sqrt: Math.sqrt, 
                abs: Math.abs,
                tan: Math.tan,
                log: Math.log,
                exp: Math.exp
            });
            if (isFinite(y)) {
                data.push({ x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)) });
            }
        } catch (e) {
            // Skip invalid points
        }
    }
    
    if (data.length === 0) {
        alert('No valid points generated. Check your equation.');
        return;
    }
    
    const ctx = document.getElementById('customChart2D');
    
    // Hide 3D canvas, show 2D chart
    document.getElementById('canvas-3d-custom').style.display = 'none';
    ctx.style.display = 'block';
    
    // Destroy existing chart if it exists
    if (ctx.chart) {
        ctx.chart.destroy();
    }
    
    ctx.chart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'y = ' + equation,
                data: data,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.3)',
                fill: false,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 2,
                showLine: true,
                parsed: {
                    x: 'x',
                    y: 'y'
                }
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: true, position: 'top' },
                title: {
                    display: true,
                    text: 'Graph: y = ' + equation
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'x',
                        font: { size: 12, weight: 'bold' }
                    },
                    min: xMin,
                    max: xMax
                },
                y: {
                    title: {
                        display: true,
                        text: 'y',
                        font: { size: 12, weight: 'bold' }
                    }
                }
            }
        }
    });
}

// Custom 3D Graph Plotting
function plot3DEquation() {
    // Show 3D canvas, hide 2D chart
    document.getElementById('canvas-3d-custom').style.display = 'block';
    document.getElementById('customChart2D').style.display = 'none';
    
    const canvas = document.getElementById('canvas-3d-custom');
    canvas.innerHTML = '';
    
    const equation = document.getElementById('customEquation').value;
    const xMin = parseFloat(document.getElementById('xMin').value) || -10;
    const xMax = parseFloat(document.getElementById('xMax').value) || 10;
    const yMin = parseFloat(document.getElementById('yMin').value) || -10;
    const yMax = parseFloat(document.getElementById('yMax').value) || 10;
    
    if (!equation) {
        alert('Please enter an equation');
        return;
    }
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x1e293b);
    canvas.appendChild(renderer.domElement);
    
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    
    const step = Math.max(1, Math.abs(xMax - xMin) / 40);
    let idx = 0;
    
    // Calculate center offset for centering in x,y direction
    const centerX = (xMin + xMax) / 2;
    const centerY = (yMin + yMax) / 2;
    
    for (let x = xMin; x <= xMax; x += step) {
        for (let y = yMin; y <= yMax; y += step) {
            try {
                const z = parseExpression(equation, { x, y, sin: Math.sin, cos: Math.cos, sqrt: Math.sqrt, abs: Math.abs });
                // Offset vertices to center them around origin
                vertices.push(x - centerX, y - centerY, isFinite(z) ? Math.min(Math.max(z, -50), 50) : 0);
                idx++;
            } catch (e) {
                vertices.push(x - centerX, y - centerY, 0);
                idx++;
            }
        }
    }
    
    const pointsPerRow = Math.floor((yMax - yMin) / step) + 1;
    for (let i = 0; i < idx - pointsPerRow - 1; i++) {
        if (i % pointsPerRow !== pointsPerRow - 1) {
            indices.push(i, i + 1, i + pointsPerRow);
            indices.push(i + 1, i + pointsPerRow + 1, i + pointsPerRow);
        }
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshPhongMaterial({
        color: 0x4ecdc4,
        opacity: 0.8,
        wireframe: false,
        side: THREE.DoubleSide
    });
    
    const surface = new THREE.Mesh(geometry, material);
    scene.add(surface);
    
    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(10, 10, 10);
    scene.add(light);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // Calculate grid size based on data range
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    const gridSize = Math.max(xRange, yRange) * 1.2; // Add 20% padding
    const gridDivisions = 20;
    
    // Add grid
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x888888, 0x444444);
    gridHelper.position.z = -10;
    scene.add(gridHelper);
    
    camera.position.set(20, 20, 20);
    camera.lookAt(0, 0, 0);
    
    let mouseDown = false;
    let mouseX = 0, mouseY = 0;
    
    renderer.domElement.addEventListener('mousedown', (e) => {
        mouseDown = true;
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    renderer.domElement.addEventListener('mousemove', (e) => {
        if (mouseDown) {
            surface.rotation.y += (e.clientX - mouseX) * 0.01;
            surface.rotation.x += (e.clientY - mouseY) * 0.01;
            mouseX = e.clientX;
            mouseY = e.clientY;
        }
    });
    
    renderer.domElement.addEventListener('mouseup', () => {
        mouseDown = false;
    });
    
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    
    animate();
}

// Plot custom points
function plotPoints() {
    const pointsText = document.getElementById('pointsInput').value;
    const points = pointsText.split('\n')
        .filter(line => line.trim())
        .map(line => {
            const [x, y] = line.trim().split(/\s+/).map(Number);
            return { x, y };
        });
    
    if (points.length < 2) {
        alert('Please enter at least 2 points');
        return;
    }
    
    const ctx = document.getElementById('pointsChart');
    
    if (ctx.chart) {
        ctx.chart.destroy();
    }
    
    ctx.chart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Data Points',
                data: points,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                pointRadius: 8,
                showLine: true,
                borderWidth: 2,
                fill: false,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true }
            },
            scales: {
                x: { type: 'linear', position: 'bottom' },
                y: { }
            }
        }
    });
}

// Laser Light Simulation
function createLaser() {
    const canvas = document.getElementById('canvas-laser');
    canvas.innerHTML = '';
    
    const angle = parseFloat(document.getElementById('laserAngle').value) * Math.PI / 180;
    const intensity = parseFloat(document.getElementById('laserIntensity').value);
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x0a0e27);
    canvas.appendChild(renderer.domElement);
    
    // Create laser beam
    const laserGeometry = new THREE.BufferGeometry();
    const laserPositions = [];
    const laserLength = 10;
    
    laserPositions.push(0, 0, 0);
    laserPositions.push(
        laserLength * Math.cos(angle),
        laserLength * Math.sin(angle),
        0
    );
    
    laserGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(laserPositions), 3));
    
    const laserMaterial = new THREE.LineBasicMaterial({
        color: 0xff0000,
        linewidth: 5,
        emissive: 0xff0000
    });
    
    const laserBeam = new THREE.Line(laserGeometry, laserMaterial);
    scene.add(laserBeam);
    
    // Create laser source
    const sourceGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const sourceMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, emissive: 0xffff00 });
    const lasersource = new THREE.Mesh(sourceGeometry, sourceMaterial);
    scene.add(lasersource);
    
    // Create light glow
    const glowGeometry = new THREE.BufferGeometry();
    const glowPositions = [];
    
    for (let i = 0; i < 100; i++) {
        const t = i / 100;
        const x = t * laserLength * Math.cos(angle);
        const y = t * laserLength * Math.sin(angle);
        const z = (Math.random() - 0.5) * 0.5;
        glowPositions.push(x, y, z);
    }
    
    glowGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(glowPositions), 3));
    const glowMaterial = new THREE.PointsMaterial({
        color: 0xff6600,
        size: 0.2,
        transparent: true,
        opacity: 0.6 * intensity
    });
    const glow = new THREE.Points(glowGeometry, glowMaterial);
    scene.add(glow);
    
    // Add grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    gridHelper.position.y = -1;
    scene.add(gridHelper);
    
    camera.position.z = 8;
    
    function animate() {
        requestAnimationFrame(animate);
        lasersource.rotation.z += 0.02;
        renderer.render(scene, camera);
    }
    
    animate();
}

// Refraction Simulation (Snell's Law)
function createRefraction() {
    const canvas = document.getElementById('canvas-refraction');
    canvas.innerHTML = '';
    
    const n1 = parseFloat(document.getElementById('n1').value) || 1;
    const n2 = parseFloat(document.getElementById('n2').value) || 1.5;
    const incidentAngle = parseFloat(document.getElementById('incidentAngle').value) * Math.PI / 180;
    
    const refractedAngle = Math.asin((n1 / n2) * Math.sin(incidentAngle));
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x1e293b);
    canvas.appendChild(renderer.domElement);
    
    // Create media boundary
    const planeGeometry = new THREE.PlaneGeometry(10, 0.1);
    const planeMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
    const boundary = new THREE.Mesh(planeGeometry, planeMaterial);
    scene.add(boundary);
    
    // Medium 1
    const med1Geometry = new THREE.PlaneGeometry(10, 5);
    const med1Material = new THREE.MeshPhongMaterial({ 
        color: 0xc0c0c0,
        opacity: 0.3,
        transparent: true
    });
    const medium1 = new THREE.Mesh(med1Geometry, med1Material);
    medium1.position.z = -0.1;
    medium1.position.y = 2.5;
    scene.add(medium1);
    
    // Medium 2
    const med2Geometry = new THREE.PlaneGeometry(10, 5);
    const med2Material = new THREE.MeshPhongMaterial({
        color: 0x4ecdc4,
        opacity: 0.2,
        transparent: true
    });
    const medium2 = new THREE.Mesh(med2Geometry, med2Material);
    medium2.position.z = -0.1;
    medium2.position.y = -2.5;
    scene.add(medium2);
    
    // Incident ray
    const incidentGeometry = new THREE.BufferGeometry();
    incidentGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
        0, 0, 0,
        -4 * Math.sin(incidentAngle), 4 * Math.cos(incidentAngle), 0
    ]), 3));
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const incidentRay = new THREE.Line(incidentGeometry, lineMaterial);
    scene.add(incidentRay);
    
    // Refracted ray
    const refractedGeometry = new THREE.BufferGeometry();
    refractedGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
        0, 0, 0,
        4 * Math.sin(refractedAngle), -4 * Math.cos(refractedAngle), 0
    ]), 3));
    const refractedRay = new THREE.Line(refractedGeometry, lineMaterial);
    scene.add(refractedRay);
    
    // Normal line
    const normalGeometry = new THREE.BufferGeometry();
    normalGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
        0, 5, 0,
        0, -5, 0
    ]), 3));
    const normalMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 1, dashed: true });
    const normalLine = new THREE.Line(normalGeometry, normalMaterial);
    scene.add(normalLine);
    
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Add grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    gridHelper.position.z = -0.5;
    scene.add(gridHelper);
    
    camera.position.z = 8;
    
    // Mouse wheel zoom
    let cameraDistance = 8;
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        cameraDistance += e.deltaY * 0.01;
        cameraDistance = Math.max(2, Math.min(20, cameraDistance));
        camera.position.z = cameraDistance;
    }, { passive: false });
    
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    
    animate();
}

// Electromagnetic Wave Visualization
function createEMWave() {
    const canvas = document.getElementById('canvas-emwave');
    canvas.innerHTML = '';
    
    const frequency = parseFloat(document.getElementById('waveFreq').value) || 5;
    const amplitude = parseFloat(document.getElementById('waveAmp').value) || 1;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x1e293b);
    canvas.appendChild(renderer.domElement);
    
    // Electric field wave
    const eFieldGeometry = new THREE.BufferGeometry();
    const eFieldPositions = [];
    
    for (let i = 0; i < 200; i++) {
        const t = i / 200 * 4 * Math.PI;
        const x = (i / 200) * 10 - 5;
        const y = amplitude * Math.sin(frequency * t);
        const z = 0;
        eFieldPositions.push(x, y, z);
    }
    
    eFieldGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(eFieldPositions), 3));
    const eFieldMaterial = new THREE.LineBasicMaterial({ color: 0xff00ff, linewidth: 2 });
    const eFieldWave = new THREE.Line(eFieldGeometry, eFieldMaterial);
    scene.add(eFieldWave);
    
    // Magnetic field wave (perpendicular)
    const bFieldGeometry = new THREE.BufferGeometry();
    const bFieldPositions = [];
    
    for (let i = 0; i < 200; i++) {
        const t = i / 200 * 4 * Math.PI;
        const x = (i / 200) * 10 - 5;
        const y = 0;
        const z = amplitude * Math.sin(frequency * t);
        bFieldPositions.push(x, y, z);
    }
    
    bFieldGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(bFieldPositions), 3));
    const bFieldMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 2 });
    const bFieldWave = new THREE.Line(bFieldGeometry, bFieldMaterial);
    scene.add(bFieldWave);
    
    // Direction arrow
    const arrowGeometry = new THREE.ConeGeometry(0.2, 0.5, 8);
    const arrowMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00 });
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrow.position.x = 5;
    scene.add(arrow);
    
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // Add grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    gridHelper.position.y = -2;
    scene.add(gridHelper);
    
    camera.position.set(0, 0, 8);
    
    // Mouse wheel zoom
    let cameraDistance = 8;
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        cameraDistance += e.deltaY * 0.01;
        cameraDistance = Math.max(2, Math.min(20, cameraDistance));
        camera.position.z = cameraDistance;
    }, { passive: false });
    
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.02;
        
        const positions = eFieldGeometry.attributes.position.array;
        for (let i = 0; i < 200; i++) {
            const t = (i / 200) * 4 * Math.PI + time;
            positions[i * 3 + 1] = amplitude * Math.sin(frequency * t);
        }
        eFieldGeometry.attributes.position.needsUpdate = true;
        
        const bPositions = bFieldGeometry.attributes.position.array;
        for (let i = 0; i < 200; i++) {
            const t = (i / 200) * 4 * Math.PI + time;
            bPositions[i * 3 + 2] = amplitude * Math.sin(frequency * t);
        }
        bFieldGeometry.attributes.position.needsUpdate = true;
        
        renderer.render(scene, camera);
    }
    
    animate();
}

// Vector Operations
function vectorAddition() {
    const ax = parseFloat(document.getElementById('ax').value);
    const ay = parseFloat(document.getElementById('ay').value);
    const az = parseFloat(document.getElementById('az').value);
    const bx = parseFloat(document.getElementById('bx').value);
    const by = parseFloat(document.getElementById('by').value);
    const bz = parseFloat(document.getElementById('bz').value);
    
    const resultX = ax + bx;
    const resultY = ay + by;
    const resultZ = az + bz;
    const magnitude = Math.sqrt(resultX**2 + resultY**2 + resultZ**2);
    
    document.getElementById('vector-result').innerHTML = `
        <strong>Vector Addition (A + B)</strong><br>
        Result: (${resultX.toFixed(2)}, ${resultY.toFixed(2)}, ${resultZ.toFixed(2)})<br>
        Magnitude: ${magnitude.toFixed(2)}
    `;
    
    visualizeVectors(ax, ay, az, bx, by, bz, resultX, resultY, resultZ, 'addition');
}

function vectorSubtraction() {
    const ax = parseFloat(document.getElementById('ax').value);
    const ay = parseFloat(document.getElementById('ay').value);
    const az = parseFloat(document.getElementById('az').value);
    const bx = parseFloat(document.getElementById('bx').value);
    const by = parseFloat(document.getElementById('by').value);
    const bz = parseFloat(document.getElementById('bz').value);
    
    const resultX = ax - bx;
    const resultY = ay - by;
    const resultZ = az - bz;
    const magnitude = Math.sqrt(resultX**2 + resultY**2 + resultZ**2);
    
    document.getElementById('vector-result').innerHTML = `
        <strong>Vector Subtraction (A - B)</strong><br>
        Result: (${resultX.toFixed(2)}, ${resultY.toFixed(2)}, ${resultZ.toFixed(2)})<br>
        Magnitude: ${magnitude.toFixed(2)}
    `;
    
    visualizeVectors(ax, ay, az, bx, by, bz, resultX, resultY, resultZ, 'subtraction');
}

function vectorDotProduct() {
    const ax = parseFloat(document.getElementById('ax').value);
    const ay = parseFloat(document.getElementById('ay').value);
    const az = parseFloat(document.getElementById('az').value);
    const bx = parseFloat(document.getElementById('bx').value);
    const by = parseFloat(document.getElementById('by').value);
    const bz = parseFloat(document.getElementById('bz').value);
    
    const dotProduct = ax*bx + ay*by + az*bz;
    const magA = Math.sqrt(ax**2 + ay**2 + az**2);
    const magB = Math.sqrt(bx**2 + by**2 + bz**2);
    const angle = Math.acos(dotProduct / (magA * magB)) * 180 / Math.PI;
    
    document.getElementById('vector-result').innerHTML = `
        <strong>Dot Product (A · B)</strong><br>
        Result: ${dotProduct.toFixed(2)}<br>
        Angle between vectors: ${angle.toFixed(2)}°<br>
        |A| = ${magA.toFixed(2)}, |B| = ${magB.toFixed(2)}
    `;
}

function vectorCrossProduct() {
    const ax = parseFloat(document.getElementById('ax').value);
    const ay = parseFloat(document.getElementById('ay').value);
    const az = parseFloat(document.getElementById('az').value);
    const bx = parseFloat(document.getElementById('bx').value);
    const by = parseFloat(document.getElementById('by').value);
    const bz = parseFloat(document.getElementById('bz').value);
    
    const resultX = ay*bz - az*by;
    const resultY = az*bx - ax*bz;
    const resultZ = ax*by - ay*bx;
    const magnitude = Math.sqrt(resultX**2 + resultY**2 + resultZ**2);
    
    document.getElementById('vector-result').innerHTML = `
        <strong>Cross Product (A × B)</strong><br>
        Result: (${resultX.toFixed(2)}, ${resultY.toFixed(2)}, ${resultZ.toFixed(2)})<br>
        Magnitude: ${magnitude.toFixed(2)}
    `;
    
    visualizeVectors(ax, ay, az, bx, by, bz, resultX, resultY, resultZ, 'cross');
}

function visualizeVectors(ax, ay, az, bx, by, bz, rx, ry, rz, type) {
    const canvas = document.getElementById('canvas-vector');
    canvas.innerHTML = '';
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x1e293b);
    canvas.appendChild(renderer.domElement);
    
    const createArrow = (x, y, z, color) => {
        const direction = new THREE.Vector3(x, y, z).normalize();
        const length = Math.sqrt(x**2 + y**2 + z**2);
        const arrowHelper = new THREE.ArrowHelper(direction, new THREE.Vector3(0, 0, 0), length, color);
        scene.add(arrowHelper);
    };
    
    createArrow(ax, ay, az, 0xff0000);
    createArrow(bx, by, bz, 0x00ff00);
    createArrow(rx, ry, rz, 0xffff00);
    
    // Add grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0x444444);
    gridHelper.position.y = -5;
    scene.add(gridHelper);
    
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    camera.position.set(8, 8, 8);
    camera.lookAt(0, 0, 0);
    
    // Mouse wheel zoom
    let cameraDistance = Math.sqrt(3) * 8;
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        cameraDistance += e.deltaY * 0.05;
        cameraDistance = Math.max(5, Math.min(30, cameraDistance));
        const distance = cameraDistance / Math.sqrt(3);
        camera.position.set(distance, distance, distance);
    }, { passive: false });
    
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    
    animate();
}

// Projectile Motion Simulator
function updateProjectileAngle() {
    const angle = document.getElementById('projAngle').value;
    document.getElementById('angleDisplay').textContent = angle + '°';
}

function launchProjectile() {
    const canvas = document.getElementById('canvas-projectile');
    canvas.innerHTML = '';
    
    const velocity = parseFloat(document.getElementById('projVelocity').value);
    const angle = parseFloat(document.getElementById('projAngle').value) * Math.PI / 180;
    const gravity = parseFloat(document.getElementById('projGravity').value);
    
    const vx = velocity * Math.cos(angle);
    const vy = velocity * Math.sin(angle);
    
    const timeOfFlight = 2 * vy / gravity;
    const maxHeight = (vy ** 2) / (2 * gravity);
    const range = vx * timeOfFlight;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x87ceeb);
    canvas.appendChild(renderer.domElement);
    
    // Mouse wheel zoom
    let cameraZoom = 35;
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        cameraZoom += e.deltaY * 0.1;
        cameraZoom = Math.max(5, Math.min(100, cameraZoom));
        const projAngle = parseFloat(document.getElementById('projAngle').value) * Math.PI / 180;
        camera.position.x = Math.sin(projAngle) * cameraZoom;
        camera.position.y = cameraZoom * 0.6;
        camera.position.z = Math.cos(projAngle) * cameraZoom;
    }, { passive: false });
    
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(200, 1);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x228b22 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    scene.add(ground);
    
    // Projectile
    const projGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const projMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const projectile = new THREE.Mesh(projGeometry, projMaterial);
    scene.add(projectile);
    
    // Trajectory
    const trajectoryGeometry = new THREE.BufferGeometry();
    const trajectoryPositions = [];
    
    for (let t = 0; t <= timeOfFlight; t += timeOfFlight / 100) {
        const x = vx * t;
        const y = vy * t - 0.5 * gravity * t * t;
        trajectoryPositions.push(x - range / 2, y, 0);
    }
    
    trajectoryGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(trajectoryPositions), 3));
    const trajectoryMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 3 });
    const trajectory = new THREE.Line(trajectoryGeometry, trajectoryMaterial);
    scene.add(trajectory);
    
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    scene.add(light);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // Add grid
    const gridHelper = new THREE.GridHelper(100, 20, 0x888888, 0x444444);
    gridHelper.position.y = 0;
    scene.add(gridHelper);
    
    camera.position.set(0, 10, 30);
    camera.lookAt(0, 5, 0);
    
    let time = 0;
    const startTime = Date.now();
    
    function animate() {
        requestAnimationFrame(animate);
        
        time = (Date.now() - startTime) / 1000;
        
        if (time <= timeOfFlight) {
            const x = vx * time - range / 2;
            const y = vy * time - 0.5 * gravity * time * time;
            projectile.position.set(x, y, 0);
        }
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    document.getElementById('projectile-info').innerHTML = `
        <h4>Projectile Motion Analysis</h4>
        <p><strong>Initial Velocity:</strong> ${velocity.toFixed(2)} m/s</p>
        <p><strong>Launch Angle:</strong> ${(angle * 180 / Math.PI).toFixed(2)}°</p>
        <p><strong>Time of Flight:</strong> ${timeOfFlight.toFixed(2)} s</p>
        <p><strong>Maximum Height:</strong> ${maxHeight.toFixed(2)} m</p>
        <p><strong>Range:</strong> ${range.toFixed(2)} m</p>
    `;
}

function resetProjectile() {
    document.getElementById('canvas-projectile').innerHTML = '';
    document.getElementById('projectile-info').innerHTML = '';
}

// ===== NEW 3D MODEL FUNCTIONS =====

// Global variable to store coordinate system scene
let coordinateSystemScene = null;
let coordinateSystemRenderer = null;
let pointMesh = null;
let lineToPoint = null;

// 3D Coordinate System
function createCoordinateSystem() {
    const canvas = document.getElementById('canvas-coordinates');
    canvas.innerHTML = '';
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x1e293b);
    canvas.appendChild(renderer.domElement);
    
    // Mouse control
    let mouseDown = false, mouseX = 0, mouseY = 0;
    let rotationX = 0, rotationY = 0;
    
    canvas.addEventListener('mousedown', (e) => {
        mouseDown = true;
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (mouseDown) {
            const deltaX = e.clientX - mouseX;
            const deltaY = e.clientY - mouseY;
            rotationY += deltaX * 0.01;
            rotationX += deltaY * 0.01;
            mouseX = e.clientX;
            mouseY = e.clientY;
        }
    });
    
    canvas.addEventListener('mouseup', () => {
        mouseDown = false;
    });
    
    canvas.addEventListener('mouseleave', () => {
        mouseDown = false;
    });
    
    // Mouse wheel zoom
    let cameraDistance = 80;
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        cameraDistance += e.deltaY * 0.05;
        cameraDistance = Math.max(10, Math.min(200, cameraDistance)); // Clamp between 10 and 200
        const distance = cameraDistance / Math.sqrt(3);
        camera.position.set(distance, distance, distance);
    }, { passive: false });
    
    // Touch controls for mobile
    let touchStartX = 0, touchStartY = 0, touchStartDistance = 0;
    let touchActive = false, pinchActive = false;
    
    canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            touchActive = true;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            touchStartDistance = Math.hypot(
                touch1.clientX - touch2.clientX,
                touch1.clientY - touch2.clientY
            );
            pinchActive = true;
        }
    }, { passive: true });
    
    canvas.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1 && touchActive) {
            const deltaX = e.touches[0].clientX - touchStartX;
            const deltaY = e.touches[0].clientY - touchStartY;
            rotationY += deltaX * 0.01;
            rotationX += deltaY * 0.01;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        } else if (e.touches.length === 2 && pinchActive) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.hypot(
                touch1.clientX - touch2.clientX,
                touch1.clientY - touch2.clientY
            );
            const zoomDelta = currentDistance - touchStartDistance;
            cameraDistance -= zoomDelta * 0.05;
            cameraDistance = Math.max(10, Math.min(200, cameraDistance));
            const distance = cameraDistance / Math.sqrt(3);
            camera.position.set(distance, distance, distance);
            touchStartDistance = currentDistance;
        }
    }, { passive: true });
    
    canvas.addEventListener('touchend', (e) => {
        if (e.touches.length === 0) {
            touchActive = false;
            pinchActive = false;
        }
    }, { passive: true });
    
    // X-axis (Red)
    const xGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(50, 0, 0)
    ]);
    const xMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 3 });
    const xAxis = new THREE.Line(xGeometry, xMaterial);
    scene.add(xAxis);
    
    // Y-axis (Green)
    const yGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 50, 0)
    ]);
    const yMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 3 });
    const yAxis = new THREE.Line(yGeometry, yMaterial);
    scene.add(yAxis);
    
    // Z-axis (Blue)
    const zGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 50)
    ]);
    const zMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 3 });
    const zAxis = new THREE.Line(zGeometry, zMaterial);
    scene.add(zAxis);
    
    // Create TextTexturecanvas for labels
    const createTextTexture = (text, color) => {
        const textCanvas = document.createElement('canvas');
        textCanvas.width = 256;
        textCanvas.height = 256;
        const ctx = textCanvas.getContext('2d');
        ctx.fillStyle = color;
        ctx.font = 'Bold 100px Arial';
        ctx.fillText(text, 50, 150);
        return new THREE.CanvasTexture(textCanvas);
    };
    
    // Add axis labels
    const labelPositions = [
        { pos: [50.5, 0, 0], text: 'X', color: '#ff0000' },
        { pos: [0, 50.5, 0], text: 'Y', color: '#00ff00' },
        { pos: [0, 0, 50.5], text: 'Z', color: '#0000ff' }
    ];
    
    const origin = new THREE.SphereGeometry(0.2, 32, 32);
    const originMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const originMesh = new THREE.Mesh(origin, originMat);
    scene.add(originMesh);
    
    // Add tick marks (every 10 units)
    for (let i = 10; i <= 50; i += 10) {
        const tickGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const tickMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        
        const xTick = new THREE.Mesh(tickGeo, tickMat);
        xTick.position.set(i, 0, 0);
        scene.add(xTick);
        
        const yTick = new THREE.Mesh(tickGeo, tickMat);
        yTick.position.set(0, i, 0);
        scene.add(yTick);
        
        const zTick = new THREE.Mesh(tickGeo, tickMat);
        zTick.position.set(0, 0, i);
        scene.add(zTick);
    }
    
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(50, 50, 50);
    scene.add(light);
    
    camera.position.set(80, 80, 80);
    camera.lookAt(0, 0, 0);
    
    function animate() {
        requestAnimationFrame(animate);
        scene.rotation.x = rotationX;
        scene.rotation.y = rotationY;
        renderer.render(scene, camera);
    }
    animate();
    
    // Store scene and renderer for plotting
    coordinateSystemScene = scene;
    coordinateSystemRenderer = renderer;
}

// Plot a point on the coordinate system
function plotPointOnCoordinates() {
    if (!coordinateSystemScene) {
        alert('Please create the coordinate system first!');
        return;
    }
    
    const x = parseFloat(document.getElementById('pointX').value) || 0;
    const y = parseFloat(document.getElementById('pointY').value) || 0;
    const z = parseFloat(document.getElementById('pointZ').value) || 0;
    
    // Remove previous point if exists
    if (pointMesh) {
        coordinateSystemScene.remove(pointMesh);
    }
    if (lineToPoint) {
        coordinateSystemScene.remove(lineToPoint);
    }
    
    // Create point sphere
    const pointGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const pointMaterial = new THREE.MeshPhongMaterial({ color: 0xff00ff, emissive: 0xff00ff });
    pointMesh = new THREE.Mesh(pointGeometry, pointMaterial);
    pointMesh.position.set(x, y, z);
    coordinateSystemScene.add(pointMesh);
    
    // Create line from origin to point
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x, y, z)
    ]);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff00ff, linewidth: 2 });
    lineToPoint = new THREE.Line(lineGeometry, lineMaterial);
    coordinateSystemScene.add(lineToPoint);
    
    // Display coordinates in console
    console.log(`Point located at: (${x}, ${y}, ${z})`);
}

// Clear the point from coordinate system
function clearPointOnCoordinates() {
    if (coordinateSystemScene) {
        if (pointMesh) {
            coordinateSystemScene.remove(pointMesh);
            pointMesh = null;
        }
        if (lineToPoint) {
            coordinateSystemScene.remove(lineToPoint);
            lineToPoint = null;
        }
        console.log('Point cleared');
    }
}

// Simple Harmonic Motion
function createSHM() {
    const canvas = document.getElementById('canvas-shm');
    canvas.innerHTML = '';
    
    const amplitude = parseFloat(document.getElementById('shmAmplitude').value) || 2;
    const frequency = parseFloat(document.getElementById('shmFrequency').value) || 1;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x1e293b);
    canvas.appendChild(renderer.domElement);
    
    // Mouse control
    let mouseDown = false, mouseX = 0, mouseY = 0;
    let rotationX = 0, rotationY = 0;
    
    canvas.addEventListener('mousedown', (e) => {
        mouseDown = true;
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (mouseDown) {
            const deltaX = e.clientX - mouseX;
            const deltaY = e.clientY - mouseY;
            rotationY += deltaX * 0.01;
            rotationX += deltaY * 0.01;
            mouseX = e.clientX;
            mouseY = e.clientY;
        }
    });
    
    canvas.addEventListener('mouseup', () => {
        mouseDown = false;
    });
    
    canvas.addEventListener('mouseleave', () => {
        mouseDown = false;
    });
    
    // Mouse wheel zoom
    let cameraDistance = 6;
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        cameraDistance += e.deltaY * 0.01;
        cameraDistance = Math.max(2, Math.min(20, cameraDistance));
        camera.position.z = cameraDistance;
    }, { passive: false });
    
    // Touch controls for mobile
    let touchStartX = 0, touchStartY = 0, touchStartDistance = 0;
    let touchActive = false, pinchActive = false;
    
    canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            touchActive = true;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            touchStartDistance = Math.hypot(
                touch1.clientX - touch2.clientX,
                touch1.clientY - touch2.clientY
            );
            pinchActive = true;
        }
    }, { passive: true });
    
    canvas.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1 && touchActive) {
            const deltaX = e.touches[0].clientX - touchStartX;
            const deltaY = e.touches[0].clientY - touchStartY;
            rotationY += deltaX * 0.01;
            rotationX += deltaY * 0.01;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        } else if (e.touches.length === 2 && pinchActive) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.hypot(
                touch1.clientX - touch2.clientX,
                touch1.clientY - touch2.clientY
            );
            const zoomDelta = currentDistance - touchStartDistance;
            cameraDistance -= zoomDelta * 0.01;
            cameraDistance = Math.max(2, Math.min(20, cameraDistance));
            camera.position.z = cameraDistance;
            touchStartDistance = currentDistance;
        }
    }, { passive: true });
    
    canvas.addEventListener('touchend', (e) => {
        if (e.touches.length === 0) {
            touchActive = false;
            pinchActive = false;
        }
    }, { passive: true });
    
    // Spring
    const springGeometry = new THREE.TubeGeometry(
        new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 5, 0)),
        8, 0.2, 8, false
    );
    const springMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
    const spring = new THREE.Mesh(springGeometry, springMaterial);
    scene.add(spring);
    
    // Mass
    const massGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const massMaterial = new THREE.MeshPhongMaterial({ color: 0xff6b6b });
    const mass = new THREE.Mesh(massGeometry, massMaterial);
    mass.position.y = 2.5;
    scene.add(mass);
    
    // Reference line
    const refGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-2, 2.5, 0),
        new THREE.Vector3(2, 2.5, 0)
    ]);
    const refMat = new THREE.LineBasicMaterial({ color: 0x888888, linewidth: 1, dashed: true });
    scene.add(new THREE.Line(refGeo, refMat));
    
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
    
    camera.position.set(5, 5, 8);
    camera.lookAt(0, 2.5, 0);
    
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.02;
        mass.position.y = 2.5 + amplitude * Math.sin(2 * Math.PI * frequency * time);
        scene.rotation.x = rotationX;
        scene.rotation.y = rotationY;
        renderer.render(scene, camera);
    }
    animate();
}

// EMF Induction by Moving Magnetic Field
function createEMFInduction() {
    const canvas = document.getElementById('canvas-emf');
    canvas.innerHTML = '';
    
    const bField = parseFloat(document.getElementById('bField').value) || 1.5;
    const emiSpeed = parseFloat(document.getElementById('emiSpeed').value) || 0.05;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x1e293b);
    canvas.appendChild(renderer.domElement);
    
    // Mouse control
    let mouseDown = false, mouseX = 0, mouseY = 0;
    let rotationX = 0, rotationY = 0;
    
    canvas.addEventListener('mousedown', (e) => {
        mouseDown = true;
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (mouseDown) {
            const deltaX = e.clientX - mouseX;
            const deltaY = e.clientY - mouseY;
            rotationY += deltaX * 0.01;
            rotationX += deltaY * 0.01;
            mouseX = e.clientX;
            mouseY = e.clientY;
        }
    });
    
    canvas.addEventListener('mouseup', () => {
        mouseDown = false;
    });
    
    canvas.addEventListener('mouseleave', () => {
        mouseDown = false;
    });
    
    // Mouse wheel zoom
    let cameraDistance = 6;
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        cameraDistance += e.deltaY * 0.01;
        cameraDistance = Math.max(2, Math.min(20, cameraDistance));
        camera.position.z = cameraDistance;
    }, { passive: false });
    
    // Touch controls for mobile
    let touchStartX = 0, touchStartY = 0, touchStartDistance = 0;
    let touchActive = false, pinchActive = false;
    
    canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            touchActive = true;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            touchStartDistance = Math.hypot(
                touch1.clientX - touch2.clientX,
                touch1.clientY - touch2.clientY
            );
            pinchActive = true;
        }
    }, { passive: true });
    
    canvas.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1 && touchActive) {
            const deltaX = e.touches[0].clientX - touchStartX;
            const deltaY = e.touches[0].clientY - touchStartY;
            rotationY += deltaX * 0.01;
            rotationX += deltaY * 0.01;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        } else if (e.touches.length === 2 && pinchActive) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.hypot(
                touch1.clientX - touch2.clientX,
                touch1.clientY - touch2.clientY
            );
            const zoomDelta = currentDistance - touchStartDistance;
            cameraDistance -= zoomDelta * 0.01;
            cameraDistance = Math.max(2, Math.min(20, cameraDistance));
            camera.position.z = cameraDistance;
            touchStartDistance = currentDistance;
        }
    }, { passive: true });
    
    canvas.addEventListener('touchend', (e) => {
        if (e.touches.length === 0) {
            touchActive = false;
            pinchActive = false;
        }
    }, { passive: true });
    
    // Coil (multiple loops)
    const coilGroup = new THREE.Group();
    for (let i = 0; i < 5; i++) {
        const curve = new THREE.EllipseCurve(0, 0, 2, 2, 0, Math.PI * 2, false, 0);
        const points = curve.getPoints(50);
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({ color: 0x4ecdc4 });
        const loop = new THREE.Line(geo, mat);
        loop.position.z = i * 0.5 - 1;
        coilGroup.add(loop);
    }
    scene.add(coilGroup);
    
    // Magnetic field representation (arrows)
    const arrowGroup = new THREE.Group();
    for (let x = -3; x <= 3; x += 1.5) {
        for (let z = -2; z <= 2; z += 1) {
            const arrow = new THREE.ArrowHelper(
                new THREE.Vector3(0, 0, 1),
                new THREE.Vector3(x, 0, z),
                1,
                0xff0000
            );
            arrowGroup.add(arrow);
        }
    }
    scene.add(arrowGroup);
    
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
    
    camera.position.set(6, 5, 8);
    camera.lookAt(0, 0, 0);
    
    function animate() {
        requestAnimationFrame(animate);
        arrowGroup.position.z += emiSpeed;
        if (arrowGroup.position.z > 3) arrowGroup.position.z = -3;
        scene.rotation.x = rotationX;
        scene.rotation.y = rotationY;
        renderer.render(scene, camera);
    }
    animate();
}

// Magnetic Field Visualization
function createMagneticField() {
    const canvas = document.getElementById('canvas-magfield');
    canvas.innerHTML = '';
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x1e293b);
    canvas.appendChild(renderer.domElement);
    
    // Mouse control
    let mouseDown = false, mouseX = 0, mouseY = 0;
    let rotationX = 0, rotationY = 0;
    
    canvas.addEventListener('mousedown', (e) => {
        mouseDown = true;
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (mouseDown) {
            const deltaX = e.clientX - mouseX;
            const deltaY = e.clientY - mouseY;
            rotationY += deltaX * 0.01;
            rotationX += deltaY * 0.01;
            mouseX = e.clientX;
            mouseY = e.clientY;
        }
    });
    
    canvas.addEventListener('mouseup', () => {
        mouseDown = false;
    });
    
    canvas.addEventListener('mouseleave', () => {
        mouseDown = false;
    });
    
    // Mouse wheel zoom
    let cameraDistance = 6;
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        cameraDistance += e.deltaY * 0.01;
        cameraDistance = Math.max(2, Math.min(20, cameraDistance));
        camera.position.set(cameraDistance, 0, cameraDistance);
    }, { passive: false });
    
    // Wire
    const wireGeo = new THREE.CylinderGeometry(0.1, 0.1, 8, 32);
    const wireMat = new THREE.MeshPhongMaterial({ color: 0xff6b6b });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wire);
    
    // Magnetic field loops
    for (let i = 0; i < 8; i++) {
        const radius = 1.5 + i * 0.3;
        const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2, false, 0);
        const points = curve.getPoints(50);
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({ color: new THREE.Color().setHSL(i / 8, 1, 0.5) });
        const loop = new THREE.Line(geo, mat);
        loop.rotation.x = Math.PI / 2;
        loop.position.y = (i - 3.5) * 1;
        scene.add(loop);
    }
    
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
    
    camera.position.set(6, 0, 6);
    camera.lookAt(0, 0, 0);
    
    function animate() {
        requestAnimationFrame(animate);
        scene.rotation.x = rotationX;
        scene.rotation.y = rotationY;
        renderer.render(scene, camera);
    }
    animate();
}

// Solenoid Visualization
function createSolenoid() {
    const canvas = document.getElementById('canvas-solenoid');
    canvas.innerHTML = '';
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x1e293b);
    canvas.appendChild(renderer.domElement);
    
    // Mouse control
    let mouseDown = false, mouseX = 0, mouseY = 0;
    let rotationX = 0, rotationY = 0;
    
    canvas.addEventListener('mousedown', (e) => {
        mouseDown = true;
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (mouseDown) {
            const deltaX = e.clientX - mouseX;
            const deltaY = e.clientY - mouseY;
            rotationY += deltaX * 0.01;
            rotationX += deltaY * 0.01;
            mouseX = e.clientX;
            mouseY = e.clientY;
        }
    });
    
    canvas.addEventListener('mouseup', () => {
        mouseDown = false;
    });
    
    canvas.addEventListener('mouseleave', () => {
        mouseDown = false;
    });
    
    // Mouse wheel zoom
    let cameraDistance = 8;
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        cameraDistance += e.deltaY * 0.01;
        cameraDistance = Math.max(3, Math.min(25, cameraDistance));
        camera.position.set(cameraDistance, cameraDistance * 0.5, cameraDistance);
    }, { passive: false });
    
    // Create solenoid coils
    const coilGroup = new THREE.Group();
    for (let i = 0; i < 20; i++) {
        const radius = 1.5;
        const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2, false, 0);
        const points = curve.getPoints(50);
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({ color: 0xff9500 });
        const loop = new THREE.Line(geo, mat);
        loop.position.z = i * 0.5 - 5;
        coilGroup.add(loop);
    }
    scene.add(coilGroup);
    
    // Magnetic field inside
    for (let i = 0; i < 20; i++) {
        const arrow = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, 1),
            new THREE.Vector3(0, 0, i * 0.5 - 5),
            0.8,
            0x4ecdc4
        );
        scene.add(arrow);
    }
    
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
    
    camera.position.set(6, 3, 8);
    camera.lookAt(0, 0, 0);
    
    function animate() {
        requestAnimationFrame(animate);
        scene.rotation.x = rotationX;
        scene.rotation.y = rotationY;
        renderer.render(scene, camera);
    }
    animate();
}

// Laser - He-Ne
function createLaserHeNe() {
    const canvas = document.getElementById('canvas-laser-hene');
    canvas.innerHTML = '';
    
    const angle = parseFloat(document.getElementById('laserAngle').value) * Math.PI / 180;
    const intensity = parseFloat(document.getElementById('laserIntensity').value);
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x0a0e27);
    canvas.appendChild(renderer.domElement);
    
    // Mouse control
    let mouseDown = false, mouseX = 0, mouseY = 0;
    let rotationX = 0, rotationY = 0;
    
    canvas.addEventListener('mousedown', (e) => {
        mouseDown = true;
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (mouseDown) {
            const deltaX = e.clientX - mouseX;
            const deltaY = e.clientY - mouseY;
            rotationY += deltaX * 0.01;
            rotationX += deltaY * 0.01;
            mouseX = e.clientX;
            mouseY = e.clientY;
        }
    });
    
    canvas.addEventListener('mouseup', () => {
        mouseDown = false;
    });
    
    canvas.addEventListener('mouseleave', () => {
        mouseDown = false;
    });
    
    // Mouse wheel zoom
    let cameraDistance = 8;
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        cameraDistance += e.deltaY * 0.01;
        cameraDistance = Math.max(3, Math.min(25, cameraDistance));
        camera.position.z = cameraDistance;
    }, { passive: false });
    
    // Touch controls for mobile
    let touchStartX = 0, touchStartY = 0, touchStartDistance = 0;
    let touchActive = false, pinchActive = false;
    
    canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            touchActive = true;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            touchStartDistance = Math.hypot(
                touch1.clientX - touch2.clientX,
                touch1.clientY - touch2.clientY
            );
            pinchActive = true;
        }
    }, { passive: true });
    
    canvas.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1 && touchActive) {
            const deltaX = e.touches[0].clientX - touchStartX;
            const deltaY = e.touches[0].clientY - touchStartY;
            rotationY += deltaX * 0.01;
            rotationX += deltaY * 0.01;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        } else if (e.touches.length === 2 && pinchActive) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.hypot(
                touch1.clientX - touch2.clientX,
                touch1.clientY - touch2.clientY
            );
            const zoomDelta = currentDistance - touchStartDistance;
            cameraDistance -= zoomDelta * 0.01;
            cameraDistance = Math.max(3, Math.min(25, cameraDistance));
            camera.position.z = cameraDistance;
            touchStartDistance = currentDistance;
        }
    }, { passive: true });
    
    canvas.addEventListener('touchend', (e) => {
        if (e.touches.length === 0) {
            touchActive = false;
            pinchActive = false;
        }
    }, { passive: true });
    
    // Laser tube
    const tubeGeo = new THREE.CylinderGeometry(0.15, 0.15, 4, 32);
    const tubeMat = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    tube.rotation.z = angle;
    scene.add(tube);
    
    // Laser beam
    const beamPositions = [];
    const beamLength = 8;
    beamPositions.push(0, 0, 0);
    beamPositions.push(
        beamLength * Math.cos(angle),
        beamLength * Math.sin(angle),
        0
    );
    
    const beamGeo = new THREE.BufferGeometry();
    beamGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(beamPositions), 3));
    const beamMat = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 3, emissive: 0xff0000 });
    const beam = new THREE.Line(beamGeo, beamMat);
    scene.add(beam);
    
    // Laser glow
    const glowGeo = new THREE.BufferGeometry();
    const glowPositions = [];
    for (let i = 0; i < 100; i++) {
        const t = i / 100;
        const x = t * beamLength * Math.cos(angle);
        const y = t * beamLength * Math.sin(angle);
        const z = (Math.random() - 0.5) * 0.5;
        glowPositions.push(x, y, z);
    }
    glowGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(glowPositions), 3));
    const glowMat = new THREE.PointsMaterial({ color: 0xff6600, size: 0.15, transparent: true, opacity: 0.6 * intensity });
    const glow = new THREE.Points(glowGeo, glowMat);
    scene.add(glow);
    
    const light = new THREE.PointLight(0xff0000, 2, 50);
    light.position.set(
        4 * Math.cos(angle),
        4 * Math.sin(angle),
        0
    );
    scene.add(light);
    
    camera.position.z = 8;
    
    function animate() {
        requestAnimationFrame(animate);
        scene.rotation.x = rotationX;
        scene.rotation.y = rotationY;
        renderer.render(scene, camera);
    }
    animate();
}

// Laser Types
function createLaserTypes() {
    const canvas = document.getElementById('canvas-laser-types');
    canvas.innerHTML = '';
    
    const laserType = document.getElementById('laserType').value;
    const laserData = {
        hene: { color: 0xff0000, wavelength: '632nm (Red)', power: '5mW' },
        co2: { color: 0xff4500, wavelength: '10.6μm (IR)', power: '100W' },
        ndyag: { color: 0xff1100, wavelength: '1064nm (IR)', power: '50W' },
        excimer: { color: 0xaa00ff, wavelength: '193nm (UV)', power: '200W' },
        diode: { color: 0xff3333, wavelength: '650nm (Red)', power: '10mW' }
    };
    
    const laser = laserData[laserType];
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x0a0e27);
    canvas.appendChild(renderer.domElement);
    
    // Mouse control
    let mouseDown = false, mouseX = 0, mouseY = 0;
    let rotationX = 0, rotationY = 0;
    
    canvas.addEventListener('mousedown', (e) => {
        mouseDown = true;
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (mouseDown) {
            const deltaX = e.clientX - mouseX;
            const deltaY = e.clientY - mouseY;
            rotationY += deltaX * 0.01;
            rotationX += deltaY * 0.01;
            mouseX = e.clientX;
            mouseY = e.clientY;
        }
    });
    
    canvas.addEventListener('mouseup', () => {
        mouseDown = false;
    });
    
    canvas.addEventListener('mouseleave', () => {
        mouseDown = false;
    });
    
    // Mouse wheel zoom
    let cameraDistance = 5;
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        cameraDistance += e.deltaY * 0.01;
        cameraDistance = Math.max(2, Math.min(15, cameraDistance));
        camera.position.set(cameraDistance, cameraDistance, cameraDistance);
    }, { passive: false });
    
    // Laser module
    const moduleGeo = new THREE.BoxGeometry(1, 1, 3);
    const moduleMat = new THREE.MeshPhongMaterial({ color: 0x222222 });
    const module = new THREE.Mesh(moduleGeo, moduleMat);
    scene.add(module);
    
    // Laser beam
    const beamGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 10)
    ]);
    const beamMat = new THREE.LineBasicMaterial({ color: laser.color, linewidth: 4, emissive: laser.color });
    const beam = new THREE.Line(beamGeo, beamMat);
    scene.add(beam);
    
    // Beam representation
    const cylinderGeo = new THREE.CylinderGeometry(0.2, 0.2, 10, 32);
    const cylinderMat = new THREE.MeshPhongMaterial({ color: laser.color, emissive: laser.color, transparent: true, opacity: 0.3 });
    const cylinder = new THREE.Mesh(cylinderGeo, cylinderMat);
    cylinder.rotation.x = Math.PI / 2;
    cylinder.position.z = 5;
    scene.add(cylinder);
    
    const light = new THREE.PointLight(laser.color, 3, 100);
    light.position.set(0, 0, 10);
    scene.add(light);
    
    camera.position.set(3, 3, 5);
    camera.lookAt(0, 0, 0);
    
    function animate() {
        requestAnimationFrame(animate);
        module.rotation.y += 0.01;
        scene.rotation.x = rotationX;
        scene.rotation.y = rotationY;
        renderer.render(scene, camera);
    }
    animate();
    
    // Display laser info
    console.log(`${laserType.toUpperCase()} Laser: ${laser.wavelength}, Power: ${laser.power}`);
}

function createSemiconductor() {
    const canvas = document.getElementById('canvas-semiconductor');
    canvas.innerHTML = '';
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x1e293b);
    canvas.appendChild(renderer.domElement);
    
    // Mouse control
    let mouseDown = false, mouseX = 0, mouseY = 0;
    let rotationX = 0, rotationY = 0;
    
    canvas.addEventListener('mousedown', (e) => {
        mouseDown = true;
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (mouseDown) {
            const deltaX = e.clientX - mouseX;
            const deltaY = e.clientY - mouseY;
            rotationY += deltaX * 0.01;
            rotationX += deltaY * 0.01;
            mouseX = e.clientX;
            mouseY = e.clientY;
        }
    });
    
    canvas.addEventListener('mouseup', () => {
        mouseDown = false;
    });
    
    canvas.addEventListener('mouseleave', () => {
        mouseDown = false;
    });
    
    // Mouse wheel zoom
    let cameraDistance = 6;
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        cameraDistance += e.deltaY * 0.01;
        cameraDistance = Math.max(2, Math.min(20, cameraDistance));
        camera.position.set(cameraDistance, cameraDistance, cameraDistance);
    }, { passive: false });
    
    // P-region (positive charge carriers - holes)
    const pRegionGeometry = new THREE.BoxGeometry(2, 3, 1);
    const pRegionMaterial = new THREE.MeshPhongMaterial({ color: 0xff6b6b, transparent: true, opacity: 0.7 });
    const pRegion = new THREE.Mesh(pRegionGeometry, pRegionMaterial);
    pRegion.position.x = -1.5;
    scene.add(pRegion);
    
    // N-region (negative charge carriers - electrons)
    const nRegionGeometry = new THREE.BoxGeometry(2, 3, 1);
    const nRegionMaterial = new THREE.MeshPhongMaterial({ color: 0x4ecdc4, transparent: true, opacity: 0.7 });
    const nRegion = new THREE.Mesh(nRegionGeometry, nRegionMaterial);
    nRegion.position.x = 1.5;
    scene.add(nRegion);
    
    // Depletion region (junction)
    const junctionGeometry = new THREE.BoxGeometry(0.3, 3, 1);
    const junctionMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00, transparent: true, opacity: 0.8 });
    const junction = new THREE.Mesh(junctionGeometry, junctionMaterial);
    scene.add(junction);
    
    // Create holes (positive carriers in P-region)
    const holeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const holeMaterial = new THREE.MeshPhongMaterial({ color: 0xff4444 });
    for (let i = 0; i < 4; i++) {
        const hole = new THREE.Mesh(holeGeometry, holeMaterial);
        hole.position.set(-2 + Math.random() * 0.8, -1 + Math.random() * 2.5, 0);
        hole.velocity = new THREE.Vector3(0.02, (Math.random() - 0.5) * 0.01, 0);
        scene.add(hole);
    }
    
    // Create electrons (negative carriers in N-region)
    const electronGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const electronMaterial = new THREE.MeshPhongMaterial({ color: 0x44ff44 });
    for (let i = 0; i < 4; i++) {
        const electron = new THREE.Mesh(electronGeometry, electronMaterial);
        electron.position.set(1.2 + Math.random() * 0.8, -1 + Math.random() * 2.5, 0);
        electron.velocity = new THREE.Vector3(-0.02, (Math.random() - 0.5) * 0.01, 0);
        scene.add(electron);
    }
    
    // Electric field direction arrows
    const arrowHelper = new THREE.ArrowHelper(
        new THREE.Vector3(-1, 0, 0),
        new THREE.Vector3(0, 2, 0),
        1.5,
        0xffaa00
    );
    scene.add(arrowHelper);
    
    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    camera.position.set(0, 0, 6);
    camera.lookAt(0, 0, 0);
    
    function animate() {
        requestAnimationFrame(animate);
        
        // Move charge carriers
        scene.children.forEach((child) => {
            if (child.velocity) {
                child.position.add(child.velocity);
                
                // Wrap around edges
                if (child.position.x > 2.5) child.position.x = -2.5;
                if (child.position.x < -2.5) child.position.x = 2.5;
                if (child.position.y > 1.8) child.position.y = -1.8;
                if (child.position.y < -1.8) child.position.y = 1.8;
            }
        });
        
        scene.rotation.x = rotationX * 0.5;
        scene.rotation.y = rotationY * 0.5;
        renderer.render(scene, camera);
    }
    
    animate();
}

function createPendulum() {
    const canvas = document.getElementById('canvas-pendulum');
    canvas.innerHTML = '';
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x1e293b);
    canvas.appendChild(renderer.domElement);
    
    // Mouse control
    let mouseDown = false, mouseX = 0, mouseY = 0;
    let rotationX = 0, rotationY = 0;
    
    canvas.addEventListener('mousedown', (e) => {
        mouseDown = true;
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (mouseDown) {
            const deltaX = e.clientX - mouseX;
            const deltaY = e.clientY - mouseY;
            rotationY += deltaX * 0.01;
            rotationX += deltaY * 0.01;
            mouseX = e.clientX;
            mouseY = e.clientY;
        }
    });
    
    canvas.addEventListener('mouseup', () => {
        mouseDown = false;
    });
    
    canvas.addEventListener('mouseleave', () => {
        mouseDown = false;
    });
    
    // Mouse wheel zoom
    let cameraDistance = 4;
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        cameraDistance += e.deltaY * 0.01;
        cameraDistance = Math.max(2, Math.min(12, cameraDistance));
        camera.position.z = cameraDistance;
    }, { passive: false });
    
    // Create pivot point
    const pivotGeometry = new THREE.SphereGeometry(0.2, 32, 32);
    const pivotMaterial = new THREE.MeshPhongMaterial({ color: 0xffa500 });
    const pivot = new THREE.Mesh(pivotGeometry, pivotMaterial);
    pivot.position.y = 2;
    scene.add(pivot);
    
    // Create rod
    const rodGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 32);
    const rodMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
    const rod = new THREE.Mesh(rodGeometry, rodMaterial);
    rod.position.y = 1;
    scene.add(rod);
    
    // Create bob
    const bobGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const bobMaterial = new THREE.MeshPhongMaterial({ color: 0x4ecdc4 });
    const bob = new THREE.Mesh(bobGeometry, bobMaterial);
    bob.position.y = 0;
    scene.add(bob);
    
    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    camera.position.z = 4;
    
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        
        time += 0.02;
        const angle = Math.sin(time) * 0.5;
        
        rod.rotation.z = angle;
        bob.position.x = Math.sin(angle) * 2;
        bob.position.y = 2 - Math.cos(angle) * 2;
        
        scene.rotation.x = rotationX;
        scene.rotation.y = rotationY;
        renderer.render(scene, camera);
    }
    
    animate();
}

function createWave() {
    const canvas = document.getElementById('canvas-wave');
    canvas.innerHTML = '';
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x1e293b);
    canvas.appendChild(renderer.domElement);
    
    // Mouse control
    let mouseDown = false, mouseX = 0, mouseY = 0;
    let rotationX = 0, rotationY = 0;
    
    canvas.addEventListener('mousedown', (e) => {
        mouseDown = true;
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (mouseDown) {
            const deltaX = e.clientX - mouseX;
            const deltaY = e.clientY - mouseY;
            rotationY += deltaX * 0.01;
            rotationX += deltaY * 0.01;
            mouseX = e.clientX;
            mouseY = e.clientY;
        }
    });
    
    canvas.addEventListener('mouseup', () => {
        mouseDown = false;
    });
    
    canvas.addEventListener('mouseleave', () => {
        mouseDown = false;
    });
    
    // Mouse wheel zoom
    let cameraDistance = 7;
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        cameraDistance += e.deltaY * 0.01;
        cameraDistance = Math.max(2, Math.min(20, cameraDistance));
        camera.position.z = cameraDistance;
    }, { passive: false });
    
    // Create wave geometry
    const waveGeometry = new THREE.BufferGeometry();
    const wavePositions = [];
    const waveIndices = [];
    
    for (let i = 0; i < 40; i++) {
        for (let j = 0; j < 40; j++) {
            wavePositions.push((i - 20) * 0.25, 0, (j - 20) * 0.25);
        }
    }
    
    for (let i = 0; i < 39; i++) {
        for (let j = 0; j < 39; j++) {
            const a = i * 40 + j;
            const b = (i + 1) * 40 + j;
            const c = i * 40 + (j + 1);
            const d = (i + 1) * 40 + (j + 1);
            
            waveIndices.push(a, b, c);
            waveIndices.push(b, d, c);
        }
    }
    
    waveGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(wavePositions), 3));
    waveGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(waveIndices), 1));
    
    const waveMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x4ecdc4,
        wireframe: true
    });
    const wave = new THREE.Mesh(waveGeometry, waveMaterial);
    scene.add(wave);
    
    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    camera.position.z = 8;
    
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        
        time += 0.01;
        const positions = waveGeometry.attributes.position.array;
        
        for (let i = 0; i < 40; i++) {
            for (let j = 0; j < 40; j++) {
                const index = (i * 40 + j) * 3 + 1;
                positions[index] = Math.sin((i + time) * 0.3) * Math.cos((j + time) * 0.3) * 0.5;
            }
        }
        
        waveGeometry.attributes.position.needsUpdate = true;
        scene.rotation.x = rotationX;
        scene.rotation.y = rotationY;
        renderer.render(scene, camera);
    }
    
    animate();
}

// Lecture Navigation
function showLecture(lectureIndex) {
    // Hide all lectures
    const lectures = document.querySelectorAll('.lecture-item');
    lectures.forEach(lecture => lecture.classList.remove('active'));
    
    // Remove active from all buttons
    const buttons = document.querySelectorAll('.lecture-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected lecture
    document.getElementById(`lecture-${lectureIndex}`).classList.add('active');
    buttons[lectureIndex].classList.add('active');
    
    // Reset lecture type to notes
    switchLectureType('notes');
    
    currentLecture = lectureIndex;
}

// Switch between lecture types (notes, videos, flowcharts)
function switchLectureType(type) {
    const lectureItem = document.querySelector('.lecture-item.active');
    if (!lectureItem) return;
    
    // Hide all content types in current lecture
    const notesContent = lectureItem.querySelector('.lecture-notes-content');
    const videosContent = lectureItem.querySelector('.lecture-videos-content');
    const flowchartContent = lectureItem.querySelector('.lecture-flowchart-content');
    
    // Remove active class from all
    if (notesContent) notesContent.classList.remove('active');
    if (videosContent) videosContent.classList.remove('active');
    if (flowchartContent) flowchartContent.classList.remove('active');
    
    // Update buttons
    const typeButtons = document.querySelectorAll('.lecture-type-btn');
    typeButtons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected type
    if (type === 'notes') {
        if (notesContent) notesContent.classList.add('active');
        document.getElementById('type-notes-btn').classList.add('active');
    } else if (type === 'videos') {
        if (videosContent) videosContent.classList.add('active');
        document.getElementById('type-videos-btn').classList.add('active');
    } else if (type === 'flowchart') {
        if (flowchartContent) flowchartContent.classList.add('active');
        document.getElementById('type-flowchart-btn').classList.add('active');
    }
}

// ===== CUSTOM QUIZ FUNCTIONS =====

// Load custom quizzes from localStorage
function loadCustomQuizzes() {
    const stored = localStorage.getItem('customQuizzes');
    customQuizzes = stored ? JSON.parse(stored) : [];
}

// Save custom quizzes to localStorage
function saveCustomQuizzesToStorage() {
    localStorage.setItem('customQuizzes', JSON.stringify(customQuizzes));
}

// Switch between Take Quiz and Create Quiz modes
function switchQuizMode(mode) {
    const takeSection = document.getElementById('take-quiz-section');
    const createSection = document.getElementById('create-quiz-section');
    const takeBtnElement = document.getElementById('take-quiz-btn');
    const createBtnElement = document.getElementById('create-quiz-btn');
    
    if (mode === 'take') {
        takeSection.style.display = 'block';
        createSection.style.display = 'none';
        takeBtnElement.classList.add('active');
        createBtnElement.classList.remove('active');
        resetQuiz();
    } else if (mode === 'create') {
        takeSection.style.display = 'none';
        createSection.style.display = 'block';
        takeBtnElement.classList.remove('active');
        createBtnElement.classList.add('active');
        resetCreateQuizForm();
    }
}

// Reset create quiz form
function resetCreateQuizForm() {
    document.getElementById('quizTitle').value = '';
    document.getElementById('quizPassword').value = '';
    document.getElementById('quizDescription').value = '';
    document.getElementById('questions-list').innerHTML = '';
    addQuestionField();
}

// Add a new question field
function addQuestionField() {
    const questionsList = document.getElementById('questions-list');
    const questionIndex = questionsList.children.length;
    
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-field';
    questionDiv.style.cssText = 'border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; background: #f9f9f9;';
    
    questionDiv.innerHTML = `
        <div class="form-group">
            <label>Question ${questionIndex + 1}:</label>
            <input type="text" class="question-text" placeholder="Enter the question" />
        </div>
        <div id="options-${questionIndex}" class="options-container" style="margin: 10px 0;">
            <div class="form-group">
                <label>Option 1 (Correct answer):</label>
                <input type="text" class="option-text" data-is-correct="true" placeholder="Enter option 1" />
            </div>
            <div class="form-group">
                <label>Option 2:</label>
                <input type="text" class="option-text" placeholder="Enter option 2" />
            </div>
            <div class="form-group">
                <label>Option 3:</label>
                <input type="text" class="option-text" placeholder="Enter option 3" />
            </div>
            <div class="form-group">
                <label>Option 4:</label>
                <input type="text" class="option-text" placeholder="Enter option 4" />
            </div>
        </div>
        <button onclick="removeQuestionField(${questionIndex})" class="quiz-btn secondary" style="width: 100%; margin-top: 10px;">Remove Question</button>
    `;
    
    questionsList.appendChild(questionDiv);
}

// Remove a question field
function removeQuestionField(index) {
    const questionsList = document.getElementById('questions-list');
    if (questionsList.children.length > 1) {
        questionsList.children[index].remove();
    } else {
        alert('You must have at least one question!');
    }
}

// Save custom quiz
function saveCustomQuiz() {
    const title = document.getElementById('quizTitle').value.trim();
    const password = document.getElementById('quizPassword').value;
    const description = document.getElementById('quizDescription').value.trim();
    
    if (!title) {
        alert('Quiz title is required!');
        return;
    }
    
    if (!password) {
        alert('Quiz password is required!');
        return;
    }
    
    const questionFields = document.querySelectorAll('.question-field');
    const questions = [];
    
    for (let i = 0; i < questionFields.length; i++) {
        const questionField = questionFields[i];
        const questionText = questionField.querySelector('.question-text').value.trim();
        const optionInputs = questionField.querySelectorAll('.option-text');
        
        if (!questionText) {
            alert(`Question ${i + 1} is empty!`);
            return;
        }
        
        const options = [];
        let correctIndex = 0;
        
        optionInputs.forEach((input, idx) => {
            const optionText = input.value.trim();
            if (!optionText) {
                alert(`Question ${i + 1} has empty options!`);
                throw new Error('Empty option');
            }
            options.push(optionText);
            if (input.getAttribute('data-is-correct') === 'true') {
                correctIndex = idx;
            }
        });
        
        questions.push({
            question: questionText,
            options: options,
            correct: correctIndex
        });
    }
    
    if (questions.length === 0) {
        alert('Please add at least one question!');
        return;
    }
    
    // Create quiz object
    const newQuiz = {
        id: Date.now(),
        title: title,
        password: password,
        description: description,
        questions: questions,
        createdDate: new Date().toLocaleString()
    };
    
    // Add to custom quizzes
    customQuizzes.push(newQuiz);
    saveCustomQuizzesToStorage();
    
    alert('Quiz created successfully!');
    switchQuizMode('take');
    displayCustomQuizzes();
}

// Display available custom quizzes
function displayCustomQuizzes() {
    loadCustomQuizzes();
    const customQuizzesGroup = document.getElementById('custom-quiz-group');
    const customQuizzesList = document.getElementById('custom-quizzes-list');
    
    if (customQuizzes.length === 0) {
        customQuizzesGroup.style.display = 'none';
        return;
    }
    
    customQuizzesGroup.style.display = 'block';
    
    customQuizzesList.innerHTML = '';
    customQuizzes.forEach((quiz, index) => {
        const quizButton = document.createElement('button');
        quizButton.className = 'quiz-level-btn';
        quizButton.style.width = '100%';
        quizButton.style.textAlign = 'left';
        quizButton.style.marginBottom = '10px';
        quizButton.innerHTML = `<strong>${quiz.title}</strong><br><small>${quiz.description || 'No description'}</small><br><small style="color: #888;">${quiz.createdDate}</small>`;
        quizButton.onclick = () => selectCustomQuiz(quiz.id);
        customQuizzesList.appendChild(quizButton);
    });
}

// Select and start a custom quiz with password verification
function selectCustomQuiz(quizId) {
    currentCustomQuizId = quizId;
    const quiz = customQuizzes.find(q => q.id === quizId);
    
    if (!quiz) {
        alert('Quiz not found!');
        return;
    }
    
    // Show password modal
    document.getElementById('quiz-name-display').textContent = `Quiz: ${quiz.title}`;
    document.getElementById('passwordInput').value = '';
    document.getElementById('password-modal').style.display = 'flex';
    document.getElementById('passwordInput').focus();
}

// Verify quiz password and start quiz
function verifyQuizPassword() {
    const password = document.getElementById('passwordInput').value;
    const quiz = customQuizzes.find(q => q.id === currentCustomQuizId);
    
    if (!quiz) {
        alert('Quiz not found!');
        closePasswordModal();
        return;
    }
    
    if (password === quiz.password) {
        closePasswordModal();
        currentCustomQuiz = quiz;
        startCustomQuiz(quiz);
    } else {
        alert('Incorrect password!');
        document.getElementById('passwordInput').value = '';
    }
}

// Close password modal
function closePasswordModal() {
    document.getElementById('password-modal').style.display = 'none';
    document.getElementById('passwordInput').value = '';
    currentCustomQuizId = null;
}

// Start custom quiz
function startCustomQuiz(quiz) {
    currentQuestion = 0;
    score = 0;
    selectedAnswer = null;
    quizAnswered = false;
    apiQuestions = quiz.questions;
    quizMode = 'custom';
    
    document.getElementById('take-quiz-section').style.display = 'none';
    document.getElementById('quiz-content').style.display = 'block';
    document.getElementById('quiz-results').style.display = 'none';
    
    displayQuestion();
}

// Quiz Functions
async function startQuiz(difficulty) {
    const quizType = document.getElementById('quizType').value;
    
    if (quizType === 'custom') {
        alert('Please select a custom quiz from the list first.');
        return;
    }
    
    currentDifficulty = difficulty;
    quizMode = difficulty;
    currentQuestion = 0;
    score = 0;
    selectedAnswer = null;
    quizAnswered = false;
    currentCustomQuiz = null;
    
    if (quizType === 'api') {
        try {
            await fetchAPIQuestions(difficulty);
        } catch (error) {
            console.log('API not available, using local questions');
            apiQuestions = [];
        }
    } else {
        apiQuestions = [];
    }
    
    document.getElementById('take-quiz-section').style.display = 'none';
    document.getElementById('quiz-content').style.display = 'block';
    document.getElementById('quiz-results').style.display = 'none';
    
    displayQuestion();
}

async function fetchAPIQuestions(difficulty) {
    const difficultyMap = { 'easy': 'easy', 'medium': 'medium', 'hard': 'hard' };
    const url = `https://opentdb.com/api.php?amount=5&category=17&difficulty=${difficultyMap[difficulty]}&type=multiple`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        apiQuestions = data.results.map(q => ({
            question: decodeHTML(q.question),
            options: [...q.incorrect_answers, q.correct_answer]
                .map(a => decodeHTML(a))
                .sort(() => Math.random() - 0.5),
            correct: [...q.incorrect_answers, q.correct_answer]
                .map(a => decodeHTML(a))
                .sort(() => Math.random() - 0.5)
                .indexOf(decodeHTML(q.correct_answer))
        }));
    } catch (error) {
        console.error('Failed to fetch API questions:', error);
        throw error;
    }
}

function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

function displayQuestion() {
    const questions = apiQuestions.length > 0 ? apiQuestions : quizzes[quizMode];
    if (!questions || currentQuestion >= questions.length) return;
    
    let question = questions[currentQuestion];
    
    document.getElementById('question-counter').textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
    document.getElementById('score-display').textContent = `Score: ${score}`;
    
    document.getElementById('quiz-question').textContent = question.question;
    
    const optionsDiv = document.getElementById('quiz-options');
    optionsDiv.innerHTML = '';
    
    // Shuffle options and track the new correct answer index
    const correctOptionText = question.options[question.correct];
    const shuffledOptions = shuffleArray(question.options);
    const newCorrectIndex = shuffledOptions.indexOf(correctOptionText);
    
    // Store the current question state with shuffled options
    const displayQuestion = {
        ...question,
        options: shuffledOptions,
        correct: newCorrectIndex
    };
    
    // Store temporarily for use in selectAnswer and nextQuestion
    window.currentDisplayQuestion = displayQuestion;
    
    shuffledOptions.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.textContent = option;
        optionDiv.onclick = () => selectAnswer(index);
        optionsDiv.appendChild(optionDiv);
    });
    
    selectedAnswer = null;
    quizAnswered = false;
}

function selectAnswer(index) {
    if (quizAnswered) return;
    
    const questions = apiQuestions.length > 0 ? apiQuestions : quizzes[quizMode];
    const question = questions[currentQuestion];
    const options = document.querySelectorAll('.option');
    
    options.forEach(opt => opt.classList.remove('selected'));
    options[index].classList.add('selected');
    
    selectedAnswer = index;
}

function nextQuestion() {
    if (selectedAnswer === null) {
        alert('Please select an answer!');
        return;
    }
    
    // Use the display question with shuffled options
    const question = window.currentDisplayQuestion;
    const options = document.querySelectorAll('.option');
    
    if (selectedAnswer === question.correct) {
        score++;
        options[selectedAnswer].classList.add('correct');
    } else {
        options[selectedAnswer].classList.add('incorrect');
        options[question.correct].classList.add('correct');
    }
    
    quizAnswered = true;
    
    setTimeout(() => {
        currentQuestion++;
        
        const questions = apiQuestions.length > 0 ? apiQuestions : quizzes[quizMode];
        if (currentQuestion < questions.length) {
            displayQuestion();
        } else {
            showResults();
        }
    }, 1500);
}

function showResults() {
    const questions = apiQuestions.length > 0 ? apiQuestions : quizzes[quizMode];
    const percentage = Math.round((score / questions.length) * 100);
    
    let message = '';
    if (percentage >= 80) {
        message = 'Excellent! You have a great understanding of physics!';
    } else if (percentage >= 60) {
        message = 'Good job! Keep practicing to improve further.';
    } else if (percentage >= 40) {
        message = 'Nice effort! Review the lectures to strengthen your knowledge.';
    } else {
        message = 'Keep learning! Visit the lecture section for more information.';
    }
    
    document.getElementById('final-score').textContent = `Score: ${score}/${questions.length} (${percentage}%)`;
    document.getElementById('result-message').textContent = message;
    
    document.getElementById('quiz-content').style.display = 'none';
    document.getElementById('quiz-results').style.display = 'block';
}

function resetQuiz() {
    apiQuestions = [];
    currentCustomQuiz = null;
    
    const takeQuizSection = document.getElementById('take-quiz-section');
    if (takeQuizSection) {
        takeQuizSection.style.display = 'block';
    } else {
        document.getElementById('quiz-start').style.display = 'block';
    }
    
    document.getElementById('quiz-content').style.display = 'none';
    document.getElementById('quiz-results').style.display = 'none';
    
    quizMode = '';
    currentQuestion = 0;
    score = 0;
    selectedAnswer = null;
    quizAnswered = false;
    
    // Update quiz type selector to show/hide difficulty buttons or custom quizzes
    const quizTypeSelect = document.getElementById('quizType');
    if (quizTypeSelect) {
        const event = new Event('change', { bubbles: true });
        quizTypeSelect.dispatchEvent(event);
    }
    
    displayCustomQuizzes();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const homeLink = document.querySelector('a[href="#home"]');
    if (homeLink) {
        showSection('home');
    }
    
    // Load and display custom quizzes
    loadCustomQuizzes();
    displayCustomQuizzes();
    
    // Add event listener for quiz type change
    const quizTypeSelect = document.getElementById('quizType');
    if (quizTypeSelect) {
        quizTypeSelect.addEventListener('change', function() {
            const difficultyGroup = document.getElementById('difficulty-group');
            const customQuizGroup = document.getElementById('custom-quiz-group');
            
            if (this.value === 'custom') {
                difficultyGroup.style.display = 'none';
                customQuizGroup.style.display = 'block';
                displayCustomQuizzes();
            } else {
                difficultyGroup.style.display = 'block';
                customQuizGroup.style.display = 'none';
            }
        });
    }
    
    // Add keyboard support for password modal
    const passwordInput = document.getElementById('passwordInput');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                verifyQuizPassword();
            }
        });
    }
});

// Handle window resize for 3D models
window.addEventListener('resize', () => {
    const canvases = document.querySelectorAll('.canvas-3d canvas');
    canvases.forEach(canvas => {
        const parent = canvas.parentElement;
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
    });
});
