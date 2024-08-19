document.addEventListener('DOMContentLoaded', async () => {
    const constructorNameElement = document.getElementById('constructor-name');
    const constructorFullNameElement = document.getElementById('constructor-fullname');
    const constructorBaseElement = document.getElementById('constructor-base');
    const constructorHighestFinishElement = document.getElementById('constructor-highest-finish');
    const constructorPolePositionsElement = document.getElementById('constructor-pole-positions');
    const constructorFastestLapsElement = document.getElementById('constructor-fastest-laps');
    const constructorSeasonsElement = document.getElementById('constructor-seasons');
    const constructorWinsElement = document.getElementById('constructor-wins');
    const constructorDriversElement = document.getElementById('constructor-drivers');
    const constructorImageElement = document.getElementById('constructor-image');
    const constructorBioElement = document.getElementById('constructor-bio');
    const chartContainer = document.getElementById('constructorStatsChart').getContext('2d');
    const urlParams = new URLSearchParams(window.location.search);
    const constructorId = urlParams.get('id');
    const dummyImageUrl = 'https://via.placeholder.com/200x200?text=No+Image+Available'; // Placeholder image URL

    // Fetch constructor details from Ergast API
    async function fetchConstructorDetails(constructorId) {
        try {
            const response = await fetch(`https://ergast.com/api/f1/constructors/${constructorId}.json`);
            const data = await response.json();
            return data.MRData.ConstructorTable.Constructors[0];
        } catch (error) {
            console.error('Error fetching constructor details:', error);
            return null;
        }
    }

    // Fetch constructor statistics and driver images
    async function fetchConstructorStats(constructorId) {
        try {
            const [resultsResponse, driversResponse] = await Promise.allSettled([
                fetch(`https://ergast.com/api/f1/constructors/${constructorId}/results.json`),
                fetch(`https://ergast.com/api/f1/constructors/${constructorId}/drivers.json`)
            ]);

            const resultsData = resultsResponse.status === 'fulfilled' ? await resultsResponse.value.json() : null;
            const driversData = driversResponse.status === 'fulfilled' ? await driversResponse.value.json() : null;

            const seasons = resultsData ? new Set(resultsData.MRData.RaceTable.Races.map(race => race.season)).size : 0;
            const wins = resultsData ? resultsData.MRData.RaceTable.Races.filter(race => race.Results[0].positionText === "1").length : 0;
            const polePositions = resultsData ? resultsData.MRData.RaceTable.Races.filter(race => race.Results[0].grid === "1").length : 0;
            const fastestLaps = resultsData ? resultsData.MRData.RaceTable.Races.filter(race => race.Results[0].FastestLap).length : 0;
            const highestFinish = `1 (x${wins})`;

            const drivers = driversData ? await Promise.all(driversData.MRData.DriverTable.Drivers.map(async driver => {
                const imageUrl = await fetchDriverImage(driver);
                return {
                    name: `${driver.givenName} ${driver.familyName}`,
                    permanentNumber: driver.permanentNumber || 'N/A',
                    driverId: driver.driverId,
                    imageUrl: imageUrl || 'https://via.placeholder.com/150?text=No+Image+Available'
                };
            })) : [];

            return {
                seasons,
                wins,
                highestFinish,
                polePositions,
                fastestLaps,
                drivers
            };
        } catch (error) {
            console.error('Error fetching constructor stats:', error);
            return null;
        }
    }

    // Fetch driver image from Wikipedia
    async function fetchDriverImage(driver) {
        try {
            const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(driver.givenName + ' ' + driver.familyName)}`);
            const data = await response.json();
            return data.originalimage ? data.originalimage.source : null;
        } catch (error) {
            console.error(`Error fetching image for driver ${driver.givenName} ${driver.familyName}:`, error);
            return null;
        }
    }

    // Fetch constructor biography and image from Wikipedia
    async function fetchConstructorBioAndImage(constructorName) {
        try {
            const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(constructorName)}`);
            const data = await response.json();

            return data && data.extract ? {
                bio: data.extract,
                image: data.originalimage ? data.originalimage.source : null
            } : null;
        } catch (error) {
            console.error('Error fetching constructor biography and image:', error);
            return null;
        }
    }

    // Render constructor details including statistics and biography
    function renderConstructorDetails(constructor, stats, constructorBioImage) {
        constructorNameElement.innerText = constructor.name;
        constructorFullNameElement.innerText = constructor.name;
        constructorBaseElement.innerText = constructor.nationality;

        if (stats) {
            constructorHighestFinishElement.innerText = stats.highestFinish;
            constructorPolePositionsElement.innerText = stats.polePositions;
            constructorFastestLapsElement.innerText = stats.fastestLaps;
            constructorSeasonsElement.innerText = stats.seasons;
            constructorWinsElement.innerText = stats.wins;
        }

        constructorImageElement.src = constructorBioImage ? constructorBioImage.image || dummyImageUrl : dummyImageUrl;
        constructorBioElement.innerHTML = constructorBioImage ? constructorBioImage.bio : 'Biography not available.';

        if (stats && stats.drivers.length > 0) {
            renderDriverImages(stats.drivers);
        }
    }

    // Render driver images and details
    function renderDriverImages(drivers) {
        constructorDriversElement.innerHTML = drivers.map(driver => `
            <div class="col-md-4 mb-3 text-center">
                <a href="../HTML/driver.html?id=${driver.driverId}">
                    <img src="${driver.imageUrl}" alt="${driver.name}" class="img-fluid">
                    <p>${driver.name} (${driver.permanentNumber})</p>
                </a>
            </div>
        `).join('');
    }

    // Render the chart using Chart.js
    function renderChart(stats) {
        new Chart(chartContainer, {
            type: 'bar',
            data: {
                labels: ['Seasons', 'Wins', 'Pole Positions', 'Fastest Laps'],
                datasets: [{
                    label: 'Constructor Statistics',
                    data: [stats.seasons, stats.wins, stats.polePositions, stats.fastestLaps],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(153, 102, 255, 0.7)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 4)',
                        'rgba(54, 162, 235, 4)',
                        'rgba(255, 206, 86, 4)',
                        'rgba(153, 102, 255, 4)'
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

    // Fetch and render constructor details
    if (constructorId) {
        const constructor = await fetchConstructorDetails(constructorId);

        if (constructor) {
            // Render basic details first
            constructorNameElement.innerText = constructor.name;
            constructorFullNameElement.innerText = constructor.name;
            constructorBaseElement.innerText = constructor.nationality;

            // Fetch additional data asynchronously and update UI
            const [constructorStats, constructorBioImage] = await Promise.all([
                fetchConstructorStats(constructorId),
                fetchConstructorBioAndImage(constructor.name)
            ]);

            renderConstructorDetails(constructor, constructorStats, constructorBioImage);

            if (constructorStats) {
                renderChart(constructorStats);
            }
        } else {
            constructorInfoContainer.innerHTML = 'Constructor not found.';
        }
    } else {
        constructorInfoContainer.innerHTML = 'No constructor ID provided.';
    }
});
