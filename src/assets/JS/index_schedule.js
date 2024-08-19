document.addEventListener('DOMContentLoaded', async function () {
    const scheduleUrl = `https://ergast.com/api/f1/current.json`;
    const circuitsUrl = `https://ergast.com/api/f1/circuits.json`;
    const countdownDisplay = document.getElementById('countdown');
    let countdownInterval;

    try {
        // Fetch the schedule
        const scheduleResponse = await fetch(scheduleUrl);
        const scheduleData = await scheduleResponse.json();
        const races = scheduleData.MRData.RaceTable.Races;

        // Fetch the circuit information
        const circuitsResponse = await fetch(circuitsUrl);
        const circuitsData = await circuitsResponse.json();
        const circuits = circuitsData.MRData.CircuitTable.Circuits;

        // Build a map of circuit ID to circuit info
        const circuitMap = circuits.reduce((map, circuit) => {
            map[circuit.circuitId] = circuit;
            return map;
        }, {});

        // Get the last 11 races
        const last11Races = races.slice(-11);

        let tableHtml = `
            <table>
                <thead>
                    <tr>
                        <th>Round</th>
                        <th>Race Name</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Circuit</th>
                    </tr>
                </thead>
                <tbody>
        `;

        let nextRaceFound = false;

        for (const race of last11Races) {
            const circuit = circuitMap[race.Circuit.circuitId] || {};
            const raceDate = new Date(`${race.date}T${race.time || "00:00:00"}`);

            tableHtml += `
                <tr>
                    <td>${race.round}</td>
                    <td><a href="./assets/HTML/circuit.html?id=${race.Circuit.circuitId}">${race.raceName}</a></td>
                    <td>${race.date}</td>
                    <td>${race.time ? race.time : '-'}</td>
                    <td><a href="./assets/HTML/circuit.html?id=${race.Circuit.circuitId}">${race.Circuit.circuitName}</a></td>
                </tr>
            `;

            // Start the countdown for the next race
            if (!nextRaceFound && raceDate > new Date()) {
                startCountdown(raceDate, race, circuit);
                nextRaceFound = true;
            }
        }

        tableHtml += '</tbody></table>';
        document.getElementById('schedule').innerHTML = tableHtml;

    } catch (error) {
        console.error('Error fetching schedule or circuits:', error);
        document.getElementById('schedule').innerHTML = 'Error fetching schedule.';
    }

    // Function to start the countdown to the next race, including race details
    function startCountdown(raceDate, race, circuit) {
        if (countdownInterval) clearInterval(countdownInterval);

        function updateCountdown() {
            const now = new Date();
            const timeLeft = raceDate - now;

            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                countdownDisplay.innerHTML = `<strong>${race.raceName}</strong> at <strong>${circuit?.circuitName || "Unknown Circuit"}</strong>, ${circuit?.Location?.locality || "Unknown Location"}, ${circuit?.Location?.country || "Unknown Country"} is starting now!`;
            } else {
                const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

                countdownDisplay.innerHTML = `
                    Next Race: <a href="./assets/HTML/circuit.html?id=${race.Circuit.circuitId}"><strong>${race.raceName}</strong> at <strong>${race.Circuit.circuitName}</strong></a><br>
                    Location: ${race.Circuit.Location.locality}, ${race.Circuit.Location.country}<br>
                    Scheduled For: ${raceDate.toLocaleDateString()} ${raceDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}<br>
                    Race In: ${days}d ${hours}h ${minutes}m ${seconds}s 
                `;
            }
        }

        updateCountdown(); // Initial call to set the correct time immediately
        countdownInterval = setInterval(updateCountdown, 1000);
    }
});
