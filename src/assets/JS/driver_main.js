document.addEventListener('DOMContentLoaded', async () => {
    const searchBox = document.getElementById('searchBox');
    const nationalitySelect = document.getElementById('nationalitySelect');
    const driverTableBody = document.getElementById('driverTableBody');
    let drivers = [];

    // Fetch all drivers
    async function fetchDrivers() {
        const url = 'https://ergast.com/api/f1/drivers.json?limit=1000'; // Fetching all drivers with a limit
        const response = await fetch(url);
        const data = await response.json();
        drivers = data.MRData.DriverTable.Drivers;
        displayDrivers(drivers);
        populateNationalities(drivers);
    }

    // Display drivers in the table
    function displayDrivers(drivers) {
        driverTableBody.innerHTML = '';
        drivers.forEach(driver => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><a href="../HTML/driver.html?id=${driver.driverId}">${driver.givenName} ${driver.familyName}</a></td>
                <td>${driver.nationality}</td>
                <td>${driver.dateOfBirth}</td>
            `;
            driverTableBody.appendChild(row);
        });
    }

    // Populate nationality dropdown
    function populateNationalities(drivers) {
        const nationalities = [...new Set(drivers.map(driver => driver.nationality))].sort();
        nationalities.forEach(nationality => {
            const option = document.createElement('option');
            option.value = nationality;
            option.text = nationality;
            nationalitySelect.add(option);
        });
    }

    // Filter drivers based on search box and nationality select
    function filterDrivers() {
        const searchText = searchBox.value.toLowerCase();
        const selectedNationality = nationalitySelect.value;

        const filteredDrivers = drivers.filter(driver => {
            const driverName = `${driver.givenName} ${driver.familyName}`.toLowerCase();
            const matchesName = driverName.includes(searchText);
            const matchesNationality = selectedNationality ? driver.nationality === selectedNationality : true;
            return matchesName && matchesNationality;
        });

        displayDrivers(filteredDrivers);
    }

    // Fetch and display drivers on page load
    await fetchDrivers();

    // Event listeners for search box and nationality select
    searchBox.addEventListener('input', filterDrivers);
    nationalitySelect.addEventListener('change', filterDrivers);
});
