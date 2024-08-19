document.addEventListener('DOMContentLoaded', async () => {
    const searchBox = document.getElementById('searchBox');
    const countrySelect = document.getElementById('countrySelect');
    const circuitTableBody = document.getElementById('circuitTableBody');
    let circuits = [];

    // Fetch all circuits
    async function fetchCircuits() {
        const url = 'https://ergast.com/api/f1/circuits.json?limit=1000'; // Fetching all circuits with a limit
        const response = await fetch(url);
        const data = await response.json();
        circuits = data.MRData.CircuitTable.Circuits;
        displayCircuits(circuits);
        populateCountries(circuits);
    }

    // Display circuits in the table
    function displayCircuits(circuits) {
        circuitTableBody.innerHTML = '';
        circuits.forEach(circuit => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><a href="circuit.html?id=${circuit.circuitId}">${circuit.circuitName}</a></td>
                <td>${circuit.Location.country}</td>
                <td>${circuit.Location.locality}</td>
            `;
            circuitTableBody.appendChild(row);
        });
    }

    // Populate country dropdown
    function populateCountries(circuits) {
        const countries = [...new Set(circuits.map(circuit => circuit.Location.country))].sort();
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.text = country;
            countrySelect.add(option);
        });
    }

    // Filter circuits based on search box and country select
    function filterCircuits() {
        const searchText = searchBox.value.toLowerCase();
        const selectedCountry = countrySelect.value;

        const filteredCircuits = circuits.filter(circuit => {
            const circuitName = circuit.circuitName.toLowerCase();
            const circuitCountry = circuit.Location.country.toLowerCase();
            const matchesName = circuitName.includes(searchText);
            const matchesCountry = selectedCountry ? circuitCountry === selectedCountry.toLowerCase() : true;
            return matchesName && matchesCountry;
        });

        displayCircuits(filteredCircuits);
    }

    // Fetch and display circuits on page load
    await fetchCircuits();

    // Event listeners for search box and country select
    searchBox.addEventListener('input', filterCircuits);
    countrySelect.addEventListener('change', filterCircuits);
});
