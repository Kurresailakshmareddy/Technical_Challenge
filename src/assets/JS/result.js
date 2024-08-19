document.addEventListener('DOMContentLoaded', async () => {
    const seasonSelect = document.getElementById('season');
    const raceNameSelect = document.getElementById('race_name');
    const defaultSeason = '2024';
    const defaultRound = 14; 

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

        if (contentId === 'race') {
            fetchRaceResults(season, round);
        } else if (contentId === 'qualifying') {
            fetchQualifyingResults(season, round);
        } else if (contentId === 'sprint') {
            fetchSprintResults(season, round);
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

        // Automatically select the 14th round if it exists and fetch its results
        const roundOptions = Array.from(raceNameSelect.options);
        const roundOption = roundOptions.find(opt => parseInt(opt.value) === defaultRound);
        if (roundOption) {
            raceNameSelect.value = defaultRound;
            fetchRaceResults(season, defaultRound);
        } else {
            // Handle the case where the 14th round is not available
            document.getElementById('race-results').innerHTML = 'The 14th round is not available for this season.';
        }
    }

    // Fetch race results
    async function fetchRaceResults(season, round) {
        const url = `https://ergast.com/api/f1/${season}/${round}/results.json`;
        const response = await fetch(url);
        const data = await response.json();
        const results = data.MRData.RaceTable.Races[0].Results;

        if (data.MRData.total === '0') {
            document.getElementById('race-results').innerHTML = 'No data found for the specified race.';
            return;
        }

        let tableHtml = '<table><tr><th>Position</th><th>Driver No.</th><th>Driver</th><th>Constructor</th><th>Grid</th><th>Lap</th><th>Time</th><th>Status</th><th>Points</th></tr>';
        results.forEach(result => {
            tableHtml += `
                <tr>
                    <td>${result.position}</td>
                    <td>${result.Driver.permanentNumber}</td>
                    <td><a href="../HTML/driver.html?id=${result.Driver.driverId}" >${result.Driver.givenName} ${result.Driver.familyName}</a></td>
                    <td><a href="../HTML/constructor.html?id=${result.Constructor.constructorId}">${result.Constructor.name}</a></td>
                    <td>${result.grid}</td>
                    <td>${result.laps}</td>
                    <td>${result.Time?.time || 'N/A'}</td>
                    <td>${result.status}</td>
                    <td>${result.points}</td>
                </tr>
            `;
        });
        tableHtml += '</table>';

        document.getElementById('race-results').innerHTML = tableHtml;
    }

    // Fetch qualifying results
    async function fetchQualifyingResults(season, round) {
        const url = `https://ergast.com/api/f1/${season}/${round}/qualifying.json`;
        const response = await fetch(url);
        const data = await response.json();
        const results = data.MRData.RaceTable.Races[0].QualifyingResults;

        if (data.MRData.total === '0') {
            document.getElementById('qualifying-results').innerHTML = 'No data found for the specified qualifying session.';
            return;
        }

        let tableHtml = '<table><tr><th>Position</th><th>Driver No.</th><th>Driver</th><th>Constructor</th><th>Q1</th><th>Q2</th><th>Q3</th></tr>';
        results.forEach(result => {
            tableHtml += `
                <tr>
                    <td>${result.position}</td>
                    <td>${result.Driver.permanentNumber}</td>
                    <td><a href="../HTML/driver.html?id=${result.Driver.driverId}">${result.Driver.givenName} ${result.Driver.familyName}</a></td>
                    <td><a href="../HTML/constructor.html?id=${result.Constructor.constructorId}">${result.Constructor.name}</a></td>
                    <td>${result.Q1 || 'N/A'}</td>
                    <td>${result.Q2 || 'N/A'}</td>
                    <td>${result.Q3 || 'N/A'}</td>
                </tr>
            `;
        });
        tableHtml += '</table>';

        document.getElementById('qualifying-results').innerHTML = tableHtml;
    }

    // Fetch sprint results
    async function fetchSprintResults(season, round) {
        const url = `https://ergast.com/api/f1/${season}/${round}/sprint.json`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.MRData.total === '0') {
            document.getElementById('sprint-results').innerHTML = 'No sprint data has been found for the specified race.';
            return;
        }

        const results = data.MRData.RaceTable.Races[0].SprintResults;
        let tableHtml = '<table><tr><th>Position</th><th>No</th><th>Driver</th><th>Constructor</th><th>Laps</th><th>Grid</th><th>Time</th><th>Status</th><th>Points</th></tr>';
        results.forEach(result => {
            tableHtml += `
                <tr>
                    <td>${result.position}</td>
                    <td>${result.Driver.permanentNumber}</td>
                    <td><a href="../HTML/driver.html?id=${result.Driver.driverId}">${result.Driver.givenName} ${result.Driver.familyName}</a></td>
                    <td><a href="../HTML/constructor.html?id=${result.Constructor.constructorId}">${result.Constructor.name}</a></td>
                    <td>${result.laps}</td>
                    <td>${result.grid}</td>
                    <td>${result.Time?.time || 'N/A'}</td>
                    <td>${result.status}</td>
                    <td>${result.points}</td>
                </tr>
            `;
        });
        tableHtml += '</table>';

        document.getElementById('sprint-results').innerHTML = tableHtml;
    }

    // Initial fetch for default season and display the latest race results
    await fetchRaceNames(defaultSeason);
});
