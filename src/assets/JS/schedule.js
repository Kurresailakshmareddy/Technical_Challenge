document.addEventListener('DOMContentLoaded', () => {
    const yearInput = document.getElementById('yearInput');
    const countrySelect = document.getElementById('countrySelect');
    const raceTableBody = document.getElementById('raceTableBody');
    const countdownDisplay = document.getElementById('countdown');
    let races = [];
    let countdownInterval;

    // Fetch all races for the specified year
    async function fetchRacesByYear() {
        const year = yearInput.value;
        const url = `http://ergast.com/api/f1/${year}.json`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            races = data.MRData.RaceTable.Races;
            displayRaces(races);
            populateCountries(races);
            startNextRaceCountdown(races);
        } catch (error) {
            console.error('Error fetching race schedule:', error);
            raceTableBody.innerHTML = '<tr><td colspan="6">Failed to load schedule. Please try again later.</td></tr>';
        }
    }

    // Display races in the table
    function displayRaces(races) {
        raceTableBody.innerHTML = '';
        races.forEach(race => {
            const raceDate = new Date(race.date + 'T' + (race.time || "00:00:00Z"));
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${race.round}</td>
                <td><a href="../HTML/circuit.html?id=${race.Circuit.circuitId}">${race.raceName}</a></td>
                <td>${raceDate.toLocaleDateString()}</td>
                <td>${race.time ? raceDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}</td>
                <td><a href="../HTML/circuit.html?id=${race.Circuit.circuitId}">${race.Circuit.circuitName}</a></td>
                <td>${race.Circuit.Location.locality}, ${race.Circuit.Location.country}</td>
            `;
            raceTableBody.appendChild(row);
        });
    }

    // Populate country dropdown
    function populateCountries(races) {
        const countries = [...new Set(races.map(race => race.Circuit.Location.country))].sort();
        countrySelect.innerHTML = '<option value="">Select Country</option>';
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.text = country;
            countrySelect.add(option);
        });
    }

    // Start countdown for the next race in the selected year
    function startNextRaceCountdown(races) {
        if (countdownInterval) clearInterval(countdownInterval);

        const now = new Date();
        const nextRace = races.find(race => new Date(race.date + 'T' + (race.time || "00:00:00Z")) > now);

        if (nextRace) {
            const raceDate = new Date(nextRace.date + 'T' + (nextRace.time || "00:00:00Z"));
            countdownInterval = setInterval(() => {
                const timeLeft = raceDate - new Date();

                if (timeLeft <= 0) {
                    clearInterval(countdownInterval);
                    countdownDisplay.innerHTML = `The <strong>${nextRace.raceName}</strong> at <strong>${nextRace.Circuit.circuitName}</strong>, ${nextRace.Circuit.Location.locality}, ${nextRace.Circuit.Location.country} is starting now!`;
                } else {
                    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

                    countdownDisplay.innerHTML = `
                        Next race: <a href="../HTML/circuit.html?id=${nextRace.Circuit.circuitId}"><strong>${nextRace.raceName}</strong> at <strong>${nextRace.Circuit.circuitName}</strong></a>, 
                        Location: ${nextRace.Circuit.Location.locality}, ${nextRace.Circuit.Location.country}<br>
                        Scheduled for: ${raceDate.toLocaleDateString()} ${raceDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}<br>
                        Race In: ${days}d ${hours}h ${minutes}m ${seconds}s
                    `;
                }
            }, 1000);
        } else {
            countdownDisplay.textContent = "No upcoming races for this year.";
        }
    }

    // Fetch and display races when the user clicks the search button
    window.fetchRacesByYear = fetchRacesByYear;

    // Event listener for country select to filter races by country
    countrySelect.addEventListener('change', () => {
        const selectedCountry = countrySelect.value;
        const filteredRaces = selectedCountry ? races.filter(race => race.Circuit.Location.country === selectedCountry) : races;
        displayRaces(filteredRaces);
    });

    // Initial fetch for the current year (default year input value)
    fetchRacesByYear();
});
