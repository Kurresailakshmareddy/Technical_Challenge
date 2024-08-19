document.addEventListener('DOMContentLoaded', () => {
    fetchDriverStandings(); // Fetch driver standings on page load as default

    // Show content based on button click
    window.showContent = function (contentId) {
        document.querySelectorAll('.content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(contentId).style.display = 'block';

        if (contentId === 'drivers') {
            fetchDriverStandings();
        } else if (contentId === 'constructors') {
            fetchConstructorStandings();
        } else if (contentId === 'lastRace') {
            fetchLastRaceResults();
        }
    };

    // Fetch driver standings
    async function fetchDriverStandings() {
        const url = 'https://ergast.com/api/f1/current/driverStandings.json';
        const response = await fetch(url);
        const data = await response.json();
        const drivers = data.MRData.StandingsTable.StandingsLists[0].DriverStandings;

        let tableHtml = '<table><tr><th>Position</th><th>Driver</th><th>Points</th><th>Wins</th></tr>';
        drivers.slice(0, 6).forEach(driver => {
            tableHtml += `
                <tr>
                    <td>${driver.position}</td>
                    <td><a href="./assets/HTML/driver.html?id=${driver.Driver.driverId}">${driver.Driver.givenName} ${driver.Driver.familyName}</a></td>
                    <td>${driver.points}</td>
                    <td>${driver.wins}</td>
                </tr>
            `;
        });
        tableHtml += '</table>';
        // tableHtml += '<button class="btn btn-primary view-results" onclick="viewDriverResults()">View Results</button>';

        document.getElementById('driver-standings').innerHTML = tableHtml;
    }

    // Fetch constructor standings
    async function fetchConstructorStandings() {
        const url = 'https://ergast.com/api/f1/current/constructorStandings.json';
        const response = await fetch(url);
        const data = await response.json();
        const constructors = data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;

        let tableHtml = '<table><tr><th>Position</th><th>Constructor</th><th>Points</th><th>Wins</th></tr>';
        constructors.slice(0, 6).forEach(constructor => {
            tableHtml += `
                <tr>
                    <td>${constructor.position}</td>
                    <td><a href="./assets/HTML/constructor.html?id=${constructor.Constructor.constructorId}">${constructor.Constructor.name}</a></td>
                    <td>${constructor.points}</td>
                    <td>${constructor.wins}</td>
                </tr>
            `;
        });
        tableHtml += '</table>';
        // tableHtml += '<button class="btn btn-primary view-results" onclick="viewConstructorResults()">View Results</button>';

        document.getElementById('constructor-standings').innerHTML = tableHtml;
    }

    // Fetch last race results
    async function fetchLastRaceResults() {
        const url = 'https://ergast.com/api/f1/current/last/results.json';
        const response = await fetch(url);
        const data = await response.json();
        const results = data.MRData.RaceTable.Races[0].Results;

        let tableHtml = '<table><tr><th>Position</th><th>Driver</th><th>Constructor</th><th>Time</th><th>Status</th></tr>';
        results.slice(0, 6).forEach(result => {
            tableHtml += `
                <tr>
                    <td>${result.position}</td>
                    <td><a href="./assets/HTML/driver.html?id=${result.Driver.driverId}">${result.Driver.givenName} ${result.Driver.familyName}</a></td>
                    <td><a href="./assets/HTML/constructor.html?id=${result.Constructor.constructorId}">${result.Constructor.name}</a></td>
                    <td>${result.Time ? result.Time.time : 'N/A'}</td>
                    <td>${result.status}</td>
                </tr>
            `;
        });
        tableHtml += '</table>';

        document.getElementById('last-race-results').innerHTML = tableHtml;
    }
});
