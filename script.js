// Global variables
let currentLecture = 0;
let quizMode = '';
let currentQuestion = 0;
let score = 0;
let selectedAnswer = null;
let quizAnswered = false;
let apiQuestions = [];
let currentDifficulty = '';

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

function switchModelsTab(tab) {
    const tabs = document.querySelectorAll('.models-tab-content');
    const buttons = document.querySelectorAll('.models-tab-btn');
    
    tabs.forEach(t => t.classList.remove('active'));
    buttons.forEach(b => b.classList.remove('active'));
    
    const tabId = tab === 'basic' ? 'basic-models' : 
                  tab === 'laser' ? 'laser-models' :
                  tab === 'vectors' ? 'vector-models' : 'projectile-models';
    
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

function createAtom() {
    const canvas = document.getElementById('canvas-atom');
    canvas.innerHTML = '';
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x1e293b);
    canvas.appendChild(renderer.domElement);
    
    // Create nucleus
    const nucleusGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const nucleusMaterial = new THREE.MeshPhongMaterial({ color: 0xff6b6b });
    const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
    scene.add(nucleus);
    
    // Create electrons
    const electronGeometry = new THREE.SphereGeometry(0.2, 32, 32);
    const electronMaterial = new THREE.MeshPhongMaterial({ color: 0x4ecdc4 });
    
    for (let i = 0; i < 3; i++) {
        const electron = new THREE.Mesh(electronGeometry, electronMaterial);
        electron.position.set(Math.cos(i * 2.1) * 2, Math.sin(i * 2.1) * 2, 0);
        electron.orbitRadius = 2;
        electron.orbitSpeed = 0.01 * (i + 1);
        electron.angle = i * 2.1;
        scene.add(electron);
    }
    
    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    camera.position.z = 5;
    
    function animate() {
        requestAnimationFrame(animate);
        
        nucleus.rotation.x += 0.002;
        nucleus.rotation.y += 0.003;
        
        scene.children.forEach((child, index) => {
            if (child.orbitRadius) {
                child.angle += child.orbitSpeed;
                child.position.x = Math.cos(child.angle) * child.orbitRadius;
                child.position.y = Math.sin(child.angle) * child.orbitRadius;
            }
        });
        
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
        
        renderer.render(scene, camera);
    }
    
    animate();
}

function createSolarSystem() {
    const canvas = document.getElementById('canvas-solar');
    canvas.innerHTML = '';
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x000000);
    canvas.appendChild(renderer.domElement);
    
    // Sun
    const sunGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sunMaterial = new THREE.MeshPhongMaterial({ color: 0xfdb813 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);
    
    // Create planets
    const planets = [
        { name: 'Mercury', size: 0.1, distance: 1.5, color: 0x8c7853, speed: 0.04 },
        { name: 'Venus', size: 0.15, distance: 2.5, color: 0xffc649, speed: 0.025 },
        { name: 'Earth', size: 0.16, distance: 3.5, color: 0x0077be, speed: 0.017 },
        { name: 'Mars', size: 0.12, distance: 4.5, color: 0xff6b6b, speed: 0.013 }
    ];
    
    planets.forEach(planetData => {
        const geometry = new THREE.SphereGeometry(planetData.size, 32, 32);
        const material = new THREE.MeshPhongMaterial({ color: planetData.color });
        const planet = new THREE.Mesh(geometry, material);
        planet.distance = planetData.distance;
        planet.speed = planetData.speed;
        planet.angle = Math.random() * Math.PI * 2;
        scene.add(planet);
    });
    
    // Lighting
    const light = new THREE.PointLight(0xffffff, 1.5, 100);
    light.position.set(0, 0, 5);
    scene.add(light);
    
    camera.position.z = 7;
    
    function animate() {
        requestAnimationFrame(animate);
        
        scene.children.forEach(child => {
            if (child.distance) {
                child.angle += child.speed;
                child.position.x = Math.cos(child.angle) * child.distance;
                child.position.z = Math.sin(child.angle) * child.distance;
            }
        });
        
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
    
    currentLecture = lectureIndex;
}

// Quiz Functions
async function startQuiz(difficulty) {
    const quizType = document.getElementById('quizType').value;
    
    currentDifficulty = difficulty;
    quizMode = difficulty;
    currentQuestion = 0;
    score = 0;
    selectedAnswer = null;
    quizAnswered = false;
    
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
    
    document.getElementById('quiz-start').style.display = 'none';
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
    
    const question = questions[currentQuestion];
    
    document.getElementById('question-counter').textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
    document.getElementById('score-display').textContent = `Score: ${score}`;
    
    document.getElementById('quiz-question').textContent = question.question;
    
    const optionsDiv = document.getElementById('quiz-options');
    optionsDiv.innerHTML = '';
    
    question.options.forEach((option, index) => {
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
    
    const questions = apiQuestions.length > 0 ? apiQuestions : quizzes[quizMode];
    const question = questions[currentQuestion];
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
    document.getElementById('quiz-start').style.display = 'block';
    document.getElementById('quiz-content').style.display = 'none';
    document.getElementById('quiz-results').style.display = 'none';
    
    quizMode = '';
    currentQuestion = 0;
    score = 0;
    selectedAnswer = null;
    quizAnswered = false;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const homeLink = document.querySelector('a[href="#home"]');
    if (homeLink) {
        showSection('home');
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
