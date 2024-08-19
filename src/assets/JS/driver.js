document.addEventListener('DOMContentLoaded', async () => {
    const driverInfoContainer = document.getElementById('driver-info');
    const driverNameElement = document.getElementById('driver-name');
    const driverNumberElement = document.getElementById('driver-number');
    const driverNationalityElement = document.getElementById('driver-nationality');
    const driverDobElement = document.getElementById('driver-dob');
    const driverSeasonsElement = document.getElementById('driver-seasons');
    const driverWinsElement = document.getElementById('driver-wins');
    const driverFastestLapsElement = document.getElementById('driver-fastest-laps');
    const driverGridPositionsElement = document.getElementById('driver-grid-positions');
    const driverImageElement = document.getElementById('driver-image');
    const driverBioElement = document.getElementById('driver-bio');
    const driverCircuitsElement = document.getElementById('driver-circuits');
    const chartContainer = document.getElementById('driverStatsChart').getContext('2d');
    const urlParams = new URLSearchParams(window.location.search);
    const driverId = urlParams.get('id');

    // Cache for API responses to avoid redundant calls
    const apiCache = {};

    // Optimized fetch with caching
    async function cachedFetch(url) {
        if (apiCache[url]) {
            return apiCache[url];
        } else {
            const response = await fetch(url);
            const data = await response.json();
            apiCache[url] = data;
            return data;
        }
    }

    // Fetch all circuits data
    async function fetchAllCircuits() {
        try {
            const data = await cachedFetch('http://ergast.com/api/f1/circuits.json');
            return data.MRData.CircuitTable.Circuits;
        } catch (error) {
            console.error('Error fetching all circuits:', error);
            return [];
        }
    }

    // Fetch driver details, stats, and bio/image in parallel
    async function fetchDriverDetails(driverId) {
        try {
            const [driverData, driverStats, driverBioImage] = await Promise.all([
                cachedFetch(`https://ergast.com/api/f1/drivers/${driverId}.json`),
                fetchDriverStats(driverId),
                fetchDriverBioAndImage(driverId)
            ]);

            const driver = driverData.MRData.DriverTable.Drivers[0];

            if (driver) {
                renderDriverDetails(driver, driverStats, driverBioImage);
                renderChart(driverStats);
            } else {
                driverInfoContainer.innerHTML = 'Driver not found.';
            }
        } catch (error) {
            console.error('Error fetching driver details:', error);
            driverInfoContainer.innerHTML = 'Error fetching driver details.';
        }
    }

    // Fetch driver statistics with caching
    async function fetchDriverStats(driverId) {
        try {
            const [seasonsData, resultsData, allCircuits] = await Promise.all([
                cachedFetch(`https://ergast.com/api/f1/drivers/${driverId}/seasons.json`),
                cachedFetch(`https://ergast.com/api/f1/drivers/${driverId}/results.json`),
                fetchAllCircuits()
            ]);

            const seasons = seasonsData.MRData.SeasonTable.Seasons.length;
            const wins = resultsData.MRData.RaceTable.Races.filter(race =>
                race.Results[0].positionText === "1"
            ).length;

            const fastestLaps = resultsData.MRData.RaceTable.Races.filter(race =>
                race.Results[0].FastestLap
            ).length;

            const gridPositions = resultsData.MRData.RaceTable.Races.reduce((acc, race) => acc + parseInt(race.Results[0].grid, 10), 0);

            // Create a list of circuit objects with both circuitId and circuitName
            const circuits = Array.from(new Set(resultsData.MRData.RaceTable.Races.map(race => {
                const circuit = allCircuits.find(c => c.circuitName === race.Circuit.circuitName);
                return circuit ? { circuitId: circuit.circuitId, circuitName: circuit.circuitName } : null;
            }))).filter(circuit => circuit);

            return {
                seasons,
                wins,
                fastestLaps,
                gridPositions,
                circuits
            };
        } catch (error) {
            console.error('Error fetching driver stats:', error);
            return null;
        }
    }

    // Fetch driver biography and image from Wikipedia with caching
    async function fetchDriverBioAndImage(driverId) {
        try {
            const driverName = driverId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            const data = await cachedFetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(driverName)}`);

            if (data && data.extract) {
                return {
                    bio: data.extract,
                    image: data.originalimage ? data.originalimage.source : null
                };
            } else {
                return { bio: 'Biography not available.', image: null };
            }
        } catch (error) {
            console.error('Error fetching driver biography and image:', error);
            return { bio: 'Biography not available.', image: null };
        }
    }

    // Render driver details including statistics and biography
    function renderDriverDetails(driver, stats, driverBioImage) {
        if (!stats) {
            driverInfoContainer.innerHTML = 'Error fetching driver statistics.';
            return;
        }

        const dummyImageUrl = 'https://via.placeholder.com/200x300?text=No+Image+Available'; // Dummy image URL

        const domUpdates = [];
        domUpdates.push(() => driverNameElement.innerText = `${driver.givenName} ${driver.familyName}`);
        domUpdates.push(() => driverNumberElement.innerText = driver.permanentNumber || 'N/A');
        domUpdates.push(() => driverNationalityElement.innerText = driver.nationality);
        domUpdates.push(() => driverDobElement.innerText = driver.dateOfBirth || 'N/A');
        domUpdates.push(() => driverSeasonsElement.innerText = stats.seasons);
        domUpdates.push(() => driverWinsElement.innerText = stats.wins);
        domUpdates.push(() => driverFastestLapsElement.innerText = stats.fastestLaps);
        domUpdates.push(() => driverGridPositionsElement.innerText = stats.gridPositions);
        domUpdates.push(() => driverImageElement.src = driverBioImage.image || dummyImageUrl);

        // Render circuits in a two-column grid with proper circuit names
        domUpdates.push(() => {
            driverCircuitsElement.innerHTML = stats.circuits.map(circuit => `
            <div class="col-md-6 mb-3">
                <div class="card">
                    <div class="card-body">
                        <p class="card-text">
                            <a href="../HTML/circuit.html?id=${circuit.circuitId}">
                                ${circuit.circuitName}
                            </a>
                        </p>
                    </div>
                </div>
            </div>
            `).join('');
        });

        // Render biography
        domUpdates.push(() => driverBioElement.innerHTML = driverBioImage.bio);

        // Apply all DOM updates at once
        domUpdates.forEach(update => update());
    }

    // Render the chart using Chart.js
    function renderChart(stats) {
        new Chart(chartContainer, {
            type: 'bar',
            data: {
                labels: ['Seasons', 'Wins', 'Fastest Laps', 'Grid Positions'],
                datasets: [{
                    label: 'Driver Statistics',
                    data: [stats.seasons, stats.wins, stats.fastestLaps, stats.gridPositions],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(153, 102, 255, 0.7)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Fetch driver details for the specified driverId
    if (driverId) {
        await fetchDriverDetails(driverId);
    } else {
        driverInfoContainer.innerHTML = 'No driver ID provided.';
    }
});
