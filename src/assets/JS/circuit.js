document.addEventListener('DOMContentLoaded', async () => {
    const circuitNameElement = document.getElementById('circuit-name');
    const circuitLocationElement = document.getElementById('circuit-location');
    const circuitCountryElement = document.getElementById('circuit-country');
    const circuitLengthElement = document.getElementById('circuit-length');
    const circuitFirstGpElement = document.getElementById('circuit-first-gp');
    const circuitLastGpElement = document.getElementById('circuit-last-gp');
    const circuitTotalRacesElement = document.getElementById('circuit-total-races');
    const circuitImageElement = document.getElementById('circuit-image');
    const circuitBioElement = document.getElementById('circuit-bio');
    const raceTableBody = document.getElementById('raceTableBody');
    const pitStopTableBody = document.getElementById('pitStopTableBody');

    const urlParams = new URLSearchParams(window.location.search);
    const circuitId = urlParams.get('id');

    if (!circuitId) {
        document.getElementById('circuit-details').innerHTML = 'No circuit ID provided.';
        return;
    }

    // Cache circuit data to reduce redundant fetches
    const circuitCache = {};

    // Fetch circuit details from Ergast API
    async function fetchCircuitDetails(circuitId) {
        if (circuitCache[circuitId]) {
            return circuitCache[circuitId];
        }

        try {
            const response = await fetch(`https://ergast.com/api/f1/circuits/${circuitId}.json`);
            const data = await response.json();
            const circuit = data.MRData.CircuitTable.Circuits[0];

            if (circuit) {
                circuitCache[circuitId] = circuit;
                return circuit;
            } else {
                throw new Error('Circuit not found');
            }
        } catch (error) {
            console.error('Error fetching circuit details:', error);
            throw error;
        }
    }

    // Fetch all seasons and determine the first and last Grand Prix at the circuit
    async function fetchCircuitStats(circuitId) {
        try {
            const seasonsResponse = await fetch('https://ergast.com/api/f1/seasons.json?limit=100');
            const seasonsData = await seasonsResponse.json();
            const seasons = seasonsData.MRData.SeasonTable.Seasons.map(season => season.season);

            let firstRace = null;
            let lastRace = null;
            let totalRaces = 0;

            // Fetch results in parallel for faster execution
            const fetchResultsPromises = seasons.map(season => fetch(`https://ergast.com/api/f1/${season}/circuits/${circuitId}/results.json`).then(response => response.json()));

            const resultsDataArray = await Promise.all(fetchResultsPromises);

            resultsDataArray.forEach(resultsData => {
                const races = resultsData.MRData.RaceTable.Races;

                if (races.length > 0) {
                    totalRaces += races.length;

                    if (!firstRace) {
                        firstRace = races[0];
                    }
                    lastRace = races[races.length - 1];
                }
            });

            return {
                totalRaces,
                firstGp: firstRace ? `${firstRace.season} - ${firstRace.raceName} (${firstRace.date})` : 'N/A',
                lastGp: lastRace ? `${lastRace.season} - ${lastRace.raceName} (${lastRace.date})` : 'N/A',
                lastGpSeason: lastRace ? lastRace.season : null
            };
        } catch (error) {
            console.error('Error fetching circuit stats:', error);
            return null;
        }
    }

    // Fetch circuit biography and image from Wikipedia
    async function fetchCircuitBioAndImage(circuitName) {
        try {
            const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(circuitName)}`);
            const data = await response.json();

            if (data && data.extract) {
                return {
                    bio: data.extract,
                    image: data.originalimage ? data.originalimage.source : null
                };
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error fetching circuit biography and image:', error);
            return null;
        }
    }

    // Render circuit details including statistics and biography
    function renderCircuitDetails(circuit, stats, circuitBioImage) {
        if (!stats) {
            document.getElementById('circuit-details').innerHTML = 'Error fetching circuit statistics.';
            return;
        }

        const dummyImageUrl = 'https://via.placeholder.com/200x200?text=No+Image+Available';

        circuitNameElement.innerText = circuit.circuitName;
        circuitLocationElement.innerText = `${circuit.Location.locality}, ${circuit.Location.country}`;
        circuitCountryElement.innerText = circuit.Location.country;
        circuitLengthElement.innerText = 'N/A'; // If you have length data, you can replace this.
        circuitFirstGpElement.innerText = stats.firstGp;
        circuitLastGpElement.innerText = stats.lastGp;
        circuitTotalRacesElement.innerText = stats.totalRaces;

        circuitImageElement.src = circuitBioImage ? circuitBioImage.image || dummyImageUrl : dummyImageUrl;
        circuitBioElement.innerHTML = circuitBioImage ? circuitBioImage.bio : 'Biography not available.';
    }

    // Fetch and display race results for the last Grand Prix at the circuit
    async function fetchRaceResults(circuitId, lastGpSeason) {
        try {
            const response = await fetch(`https://ergast.com/api/f1/${lastGpSeason}/circuits/${circuitId}/results.json`);
            const data = await response.json();
            const races = data.MRData.RaceTable.Races;

            if (races.length > 0) {
                const results = races[0].Results;
                const rowsHtml = results.map(result => `
                    <tr>
                        <td><a href="../HTML/driver.html?id=${result.Driver.driverId}">${result.Driver.familyName}, ${result.Driver.givenName}</a></td>
                        <td><a href="../HTML/constructor.html?id=${result.Constructor.constructorId}">${result.Constructor.name}</a></td>
                        <td>${result.FastestLap ? result.FastestLap.Time.time : 'N/A'}</td>
                        <td>${result.grid}</td>
                        <td>${result.position}</td>
                        <td>${result.points}</td>
                    </tr>
                `).join('');
                raceTableBody.innerHTML = rowsHtml;
            } else {
                raceTableBody.innerHTML = '<tr><td colspan="6">No race results found.</td></tr>';
            }
        } catch (error) {
            console.error('Error fetching race results:', error);
            raceTableBody.innerHTML = '<tr><td colspan="6">Error fetching race results.</td></tr>';
        }
    }

    // Fetch and display pit stop summary for the last Grand Prix at the circuit
    async function fetchPitStopSummary(circuitId, lastGpSeason, lastGpRound) {
        try {
            // Fetch pit stops data
            const response = await fetch(`https://ergast.com/api/f1/${lastGpSeason}/${lastGpRound}/pitstops.json`);
            const data = await response.json();
            const pitStops = data.MRData.RaceTable.Races[0]?.PitStops || [];

            if (pitStops.length > 0) {
                const rowsHtml = pitStops.map(pitStop => `
                    <tr>
                        <td><a href="../HTML/driver.html?id=${pitStop.driverId}">${pitStop.driverId}</a></td>
                        <td>${pitStop.lap}</td>
                        <td>${pitStop.stop}</td>
                        <td>${pitStop.duration}</td>
                        <td>${pitStop.time}</td>
                    </tr>
                `).join('');
                pitStopTableBody.innerHTML = rowsHtml;
            } else {
                pitStopTableBody.innerHTML = '<tr><td colspan="5">No pit stop data found.</td></tr>';
            }
        } catch (error) {
            console.error('Error fetching pit stop summary:', error);
            pitStopTableBody.innerHTML = '<tr><td colspan="5">Error fetching pit stop summary.</td></tr>';
        }
    }

    // Fetch the last Grand Prix round number at the circuit
    async function fetchLastGpRound(circuitId, season) {
        try {
            const response = await fetch(`https://ergast.com/api/f1/${season}/circuits/${circuitId}/results.json`);
            const data = await response.json();
            const races = data.MRData.RaceTable.Races;

            if (races.length > 0) {
                return races[0].round;
            }
            return null;
        } catch (error) {
            console.error('Error fetching last Grand Prix round:', error);
            return null;
        }
    }

    try {
        const circuit = await fetchCircuitDetails(circuitId);
        const circuitStats = await fetchCircuitStats(circuitId);
        const circuitBioImage = await fetchCircuitBioAndImage(circuit.circuitName);

        renderCircuitDetails(circuit, circuitStats, circuitBioImage);

        if (circuitStats.lastGpSeason) {
            const lastGpRound = await fetchLastGpRound(circuitId, circuitStats.lastGpSeason);
            await fetchRaceResults(circuitId, circuitStats.lastGpSeason, lastGpRound);
            await fetchPitStopSummary(circuitId, circuitStats.lastGpSeason, lastGpRound);
        }
    } catch (error) {
        document.getElementById('circuit-details').innerHTML = 'Error fetching circuit details.';
    }
});
