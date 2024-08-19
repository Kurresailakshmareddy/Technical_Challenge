document.addEventListener('DOMContentLoaded', async () => {
    const seasonSelect = document.getElementById('season');
    const raceNameSelect = document.getElementById('race_name');
    const lapInput = document.getElementById('lap');
    const defaultSeason = '2024';

    // Populate season dropdown
    for (let year = 2024; year >= 1950; year--) {
        let option = document.createElement('option');
        option.value = year;
        option.text = year;
        seasonSelect.add(option);
    }
    seasonSelect.value = defaultSeason;

    // Fetch and populate race names for the default season
    await fetchRaceNames(defaultSeason);

    // Fetch race names when season is changed
    seasonSelect.addEventListener('change', async () => {
        await fetchRaceNames(seasonSelect.value);
    });

    // Show content based on button click
    window.showContent = function (contentId) {
        document.querySelectorAll('.content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(contentId).style.display = 'block';

        const season = seasonSelect.value;
        const round = raceNameSelect.value;
        const lap = lapInput.value || 1;

        if (contentId === 'drivers') {
            fetchDriverStandings(season);
        } else if (contentId === 'constructors') {
            fetchConstructorStandings(season);
        } else if (contentId === 'lapSummary') {
            fetchLapSummary(season, round, lap);
        } else if (contentId === 'pitStopSummary') {
            fetchPitStopSummary(season, round);
        }
    };

    // Fetch race names and rounds
    async function fetchRaceNames(season) {
        const url = `https://ergast.com/api/f1/${season}.json`;
        const response = await fetch(url);
        const data = await response.json();
        const races = data.MRData.RaceTable.Races;

        raceNameSelect.innerHTML = ''; // Clear previous options
        races.forEach(race => {
            let option = document.createElement('option');
            option.value = race.round;
            option.text = race.raceName;
            raceNameSelect.add(option);
        });
    }

    // Fetch driver standings
    async function fetchDriverStandings(season) {
        const url = `https://ergast.com/api/f1/${season}/driverStandings.json`;
        const response = await fetch(url);
        const data = await response.json();
        const drivers = data.MRData.StandingsTable.StandingsLists[0].DriverStandings;

        let tableHtml = '<table><tr><th>Position</th><th>Driver</th><th>Constructor</th><th>Points</th><th>Wins</th></tr>';
        drivers.forEach(driver => {
            tableHtml += `
                <tr>
                    <td>${driver.position}</td>
                    <td><a href="../HTML/driver.html?id=${driver.Driver.driverId}">${driver.Driver.givenName} ${driver.Driver.familyName}</a></td>
                    <td>${driver.Constructors[0].name}</td>
                    <td>${driver.points}</td>
                    <td>${driver.wins}</td>
                </tr>
            `;
        });
        tableHtml += '</table>';

        document.getElementById('driver-standings').innerHTML = tableHtml;
    }

    // Fetch constructor standings
    async function fetchConstructorStandings(season) {
        const url = `https://ergast.com/api/f1/${season}/constructorStandings.json`;
        const response = await fetch(url);
        const data = await response.json();
        const constructors = data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;

        let tableHtml = '<table><tr><th>Position</th><th>Constructor</th><th>Nationality</th><th>Points</th><th>Wins</th></tr>';
        constructors.forEach(constructor => {
            tableHtml += `
                <tr>
                    <td>${constructor.position}</td>
                    <td><a href="../HTML/constructor.html?id=${constructor.Constructor.constructorId}">${constructor.Constructor.name}</a></td>
                    <td>${constructor.Constructor.nationality}</td>
                    <td>${constructor.points}</td>
                    <td>${constructor.wins}</td>
                </tr>
            `;
        });
        tableHtml += '</table>';

        document.getElementById('constructor-standings').innerHTML = tableHtml;
    }

    // Fetch lap summary
    async function fetchLapSummary(season, round, lap) {
        const url = `https://ergast.com/api/f1/${season}/${round}/laps/${lap}.json`;
        const response = await fetch(url);
        const data = await response.json();
        const lapData = data.MRData.RaceTable.Races[0].Laps[0].Timings;

        let tableHtml = '<table><tr><th>Position</th><th>Driver</th><th>Lap Time</th></tr>';
        lapData.forEach(timing => {
            tableHtml += `
                <tr>
                    <td>${timing.position}</td>
                    <td><a href="../HTML/driver.html?id=${timing.driverId}">${timing.driverId}</a></td>
                    <td>${timing.time}</td>
                </tr>
            `;
        });
        tableHtml += '</table>';

        document.getElementById('lap-summary').innerHTML = tableHtml;
    }

    // Fetch pit stop summary
    async function fetchPitStopSummary(season, round) {
        const url = `https://ergast.com/api/f1/${season}/${round}/pitstops.json`;
        const response = await fetch(url);
        const data = await response.json();
        const pitStops = data.MRData.RaceTable.Races[0].PitStops;

        let tableHtml = '<table><tr><th>Driver</th><th>Lap</th><th>Stop</th><th>Duration</th><th>Time</th></tr>';
        pitStops.forEach(pitStop => {
            tableHtml += `
                <tr>
                    <td><a href="../HTML/driver.html?id=${pitStop.driverId}">${pitStop.driverId}</a></td>
                    <td>${pitStop.lap}</td>
                    <td>${pitStop.stop}</td>
                    <td>${pitStop.duration}</td>
                    <td>${pitStop.time}</td>
                </tr>
            `;
        });
        tableHtml += '</table>';

        document.getElementById('pit-stop-summary').innerHTML = tableHtml;
    }

    // Initial fetch for default season and display driver standings
    await fetchRaceNames(defaultSeason);
    fetchDriverStandings(defaultSeason);
    showContent('drivers');
});
