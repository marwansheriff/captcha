const svgSources = {
    house: "img/house.svg",
    tree: "img/tree.svg",
    car: "img/car.svg",
    cloud: "img/cloud.svg",
    rose: "img/rose.svg",
};

let correctObject = "";
let selectedObjects = 0;

// Fetch SVG content
async function fetchSVG(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch SVG: ${url}`);
        return await response.text();
    } catch (error) {
        console.error(error);
        return '<text x="10" y="50" font-size="20">Error</text>';
    }
}

// Randomize the correct object
function randomizeCorrectObject() {
    const objects = Object.keys(svgSources);
    correctObject = objects[Math.floor(Math.random() * objects.length)];
}

// Update game message
function updateMessage(text) {
    document.getElementById("OBJmessage").textContent = text;
}

// Initialize the grid
async function initializeGrid() {
    const grid = document.getElementById("imageGrid");
    grid.innerHTML = "";
    selectedObjects = 0;
    const totalGrids = 21;
    const correctCount = 4;

    const indices = Array.from({ length: totalGrids }, (_, i) => i);
    const correctIndices = indices.sort(() => Math.random() - 0.5).slice(0, correctCount);

    for (let i = 0; i < totalGrids; i++) {
        const cell = document.createElement("div");
        const includeCorrect = correctIndices.includes(i);
        await createCompositeImage(cell, includeCorrect);
        grid.appendChild(cell);
    }
}

// Create SVG image in the grid cell and resize
async function createCompositeImage(container, includeCorrect) {
    const svgContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgContainer.setAttribute("width", "100%");
    svgContainer.setAttribute("height", "100%");
    svgContainer.setAttribute("viewBox", "0 0 200 200"); // Set a standard viewBox for scaling

    const positions = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 0, y: 100 },
        { x: 100, y: 100 },
    ];

    let objects = Object.keys(svgSources).filter(obj => obj !== correctObject);
    if (includeCorrect) objects = [correctObject, ...objects].slice(0, 4);
    else objects = objects.slice(0, 4);

    objects.sort(() => Math.random() - 0.5);

    // Loop through each object to fetch and insert the SVG content
    for (let i = 0; i < positions.length; i++) {
        const svgContent = await fetchSVG(svgSources[objects[i]]);
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.innerHTML = svgContent;
        group.setAttribute("transform", `translate(${positions[i].x}, ${positions[i].y})`);
        group.addEventListener('click', () => handleClick(objects[i], group, container));

        // Resize the SVG content to fit the container
        resizeSVG(group);

        svgContainer.appendChild(group);
    }

    container.appendChild(svgContainer);
}

// Resize SVG content using JavaScript
function resizeSVG(group) {
    const svgElements = group.querySelectorAll('svg');
    svgElements.forEach(svg => {
        // Adjust the width and height of the SVG to fit the container
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('viewBox', '0 0 120 120'); // Ensure it scales nicely
    });
}

// Handle click events
function handleClick(object, element, container) {
    if (container.classList.contains("clicked")) return;

    container.classList.add("clicked");

    if (object === correctObject) {
        selectedObjects++;
        updateMessage(`Correct! ${selectedObjects} out of 4 objects selected.`);
        container.classList.add("correct");

        if (selectedObjects === 4) {
            document.getElementById("finishButton").classList.add("show");
        }
    } else {
        updateMessage(`Incorrect! The correct object is a ${correctObject}. Try again!`);
        resetGame();
    }
}

// Reset the game
function resetGame() {
    document.getElementById("finishButton").classList.remove("show");
    randomizeCorrectObject();
    updateMessage(`Click on the ${correctObject}`);
    initializeGrid();
}

// Initialize the game on load
document.getElementById("finishButton").addEventListener('click', () => {
    alert("Congratulations! You've finished!");
    resetGame();
});

// Start the game
randomizeCorrectObject();
updateMessage(`Click on the ${correctObject}`);
initializeGrid();
