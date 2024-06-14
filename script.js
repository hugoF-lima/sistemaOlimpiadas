let jsonRowCount = null;
let countriesData = null;

async function fetchData() {
    const response = await fetch("http://127.0.0.1:5000/data");
    const data = await response.json();
    jsonRowCount = data.length;
    countriesData = data;
    return  {countriesData, jsonRowCount};
}
//TODO: Make the fetchData call happen only once.
async function getData() {
    //const {countriesData} = await fetchData();
    if (!countriesData) {
        await fetchData();
    }
    const medalsData = {}; // Object to store data by year
    countriesData.forEach(item => {
        const year = item[6]; // Extract the year from the data
        const countryData = {
            rank: item[0],
            country: item[1],
            gold: item[2],
            silver: item[3],
            bronze: item[4],
            total: item[5]
        };

        // Check if the year exists in medalsData, if not, create an array for it
        if (!medalsData[year]) {
            medalsData[year] = [];
        }

        // Push the country data into the array for the respective year
        medalsData[year].push(countryData);
    });
    console.log(medalsData);
    return {medalsData, jsonRowCount}
}

document.addEventListener('DOMContentLoaded', () => {
    /* const totalMedalsData = {
        'USA': { gold: 1180, silver: 959, bronze: 841, total: 2980 },
        'China': { gold: 275, silver: 227, bronze: 194, total: 696 },
        'Japan': { gold: 183, silver: 171, bronze: 174, total: 528 },
        'Great Britain': { gold: 296, silver: 320, bronze: 332, total: 948 },
        'ROC': { gold: 196, silver: 164, bronze: 187, total: 547 },
        // Add more countries with total medals here
    }; */

    const notableAthletes = {
        'USA': ['Michael Phelps', 'Simone Biles'],
        'China': ['Sun Yang', 'Li Ning'],
        'Japan': ['Kohei Uchimura', 'Naomi Osaka'],
        'Great Britain': ['Mo Farah', 'Jessica Ennis-Hill'],
        'ROC': ['Vladislav Tretiak', 'Svetlana Khorkina'],
        // Add more countries with notable athletes here
    };

    const tableBody = document.querySelector('#medalsTable tbody');
    const searchCountryInput = document.getElementById('searchCountry');
    const selectYear = document.getElementById('selectYear');

    let currentPage = 1; // Global variable to keep track of the current page

    function generatePaginationButtons(totalPages) {
        const paginationButtonsContainer = document.getElementById('paginationButtons');
        paginationButtonsContainer.innerHTML = '';

        // Create "Previous" button
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.addEventListener('click', () => goToPreviousPage());
        paginationButtonsContainer.appendChild(prevButton);

        // Create buttons for each page
        for (let page = 1; page <= totalPages; page++) {
            const button = document.createElement('button');
            button.textContent = page;
            button.addEventListener('click', () => goToPage(page));
            if (page === currentPage) {
                button.classList.add('active'); // Highlight current page button
            }
            paginationButtonsContainer.appendChild(button);
        }

        // Create "Next" button
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.addEventListener('click', () => goToNextPage());
        paginationButtonsContainer.appendChild(nextButton);
    }

    function goToPreviousPage() {
        if (currentPage > 1) {
            currentPage--;
            populateTable(selectYear.value, currentPage);
        }
    }

    function goToNextPage() {
        const totalPages = calculateTotalPages(jsonRowCount);
        if (currentPage < totalPages) {
            currentPage++;
            populateTable(selectYear.value, currentPage);
        }
    }

    function goToPage(page) {
        currentPage = page;
        populateTable(selectYear.value, currentPage);
    }
    
    function calculateTotalPages(rowCountGet) {
        //const totalRecords = getTotalRecords(rowCountGet); // Get total number of filtered records
        return Math.ceil(rowCountGet / 20);
    }

    async function populateTable(year, page = 1, searchQuery = '') {
        tableBody.innerHTML = '';

        const {medalsData, jsonRowCount} = await getData(); //Variables need to be the same from header
        console.log("Total rows from table: ", jsonRowCount);
        const yearString = String(year);
        const yearData = medalsData[yearString] || [];

        const filteredData = yearData.filter(data =>
            data.country.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const startIndex = (page - 1) * 20;
        const endIndex = startIndex + 20;
        const paginatedData = filteredData.slice(startIndex, endIndex);

        paginatedData.forEach(data => {
            const row = document.createElement('tr');

            for (const key in data) {
                //console.log("These are keys", key);
                const cell = document.createElement('td');
                cell.textContent = data[key];
                row.appendChild(cell);
            }

            (function(data) {
                row.addEventListener('click', async () => {
                    const countryName = data.country; // Assuming 'country' is the key for the country name
                    console.log("Country name:", countryName);
                    const totalMedals = countriesData[5];
                    const athletes = notableAthletes[countryName] || [];
                    console.log("is there something?", totalMedals);
                    if (totalMedals) {
                        localStorage.setItem('countryData', JSON.stringify({
                            country: countryName,
                            ...totalMedals
                        }));
                        window.location.href = 'country.html';
                    } else {
                        alert('Total medals data for this country is not available.');
                    }
                    });
            })(data);

            tableBody.appendChild(row);
        });

        generatePaginationButtons(calculateTotalPages(jsonRowCount));
    }

    populateTable(selectYear.value);

    // Initial population of the table

    // Event listeners for search and year selection
    searchCountryInput.addEventListener('input', () => {
        populateTable(selectYear.value, searchCountryInput.value);
    });

    selectYear.addEventListener('change', () => {
        populateTable(selectYear.value, searchCountryInput.value);
    });
});