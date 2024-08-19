document.addEventListener('DOMContentLoaded', async () => {
    const searchBox = document.getElementById('searchBox');
    const nationalitySelect = document.getElementById('nationalitySelect');
    const teamTableBody = document.getElementById('teamTableBody');
    let constructors = [];

    // Fetch all constructors
    async function fetchConstructors() {
        const url = 'https://ergast.com/api/f1/constructors.json?limit=1000'; // Fetching all constructors with a limit
        const response = await fetch(url);
        const data = await response.json();
        constructors = data.MRData.ConstructorTable.Constructors;
        displayConstructors(constructors);
        populateNationalities(constructors);
    }

    // Display constructors in the table
    function displayConstructors(constructors) {
        teamTableBody.innerHTML = '';
        constructors.forEach(constructor => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><a href="../HTML/constructor.html?id=${constructor.constructorId}">${constructor.name}</a></td>
                <td>${constructor.nationality}</td>
            `;
            teamTableBody.appendChild(row);
        });
    }

    // Populate nationality dropdown
    function populateNationalities(constructors) {
        const nationalities = [...new Set(constructors.map(constructor => constructor.nationality))].sort();
        nationalities.forEach(nationality => {
            const option = document.createElement('option');
            option.value = nationality;
            option.text = nationality;
            nationalitySelect.add(option);
        });
    }

    // Filter constructors based on search box and nationality select
    function filterDrivers() {
        const searchText = searchBox.value.toLowerCase();
        const selectedNationality = nationalitySelect.value;

        const filteredConstructors = constructors.filter(constructor => {
            const constructorName = constructor.name.toLowerCase();
            const matchesName = constructorName.includes(searchText);
            const matchesNationality = selectedNationality ? constructor.nationality === selectedNationality : true;
            return matchesName && matchesNationality;
        });

        displayConstructors(filteredConstructors);
    }

    // Fetch and display constructors on page load
    await fetchConstructors();

    // Event listeners for search box and nationality select
    searchBox.addEventListener('input', filterDrivers);
    nationalitySelect.addEventListener('change', filterDrivers);
});
