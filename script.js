let jsonRowCount = null;
let countriesData = null;

async function fetchData(yearFetch) {
    const response = await fetch(`http://127.0.0.1:5000/data?year=${yearFetch}`);
    const data = await response.json();
    jsonRowCount = data.length;
    countriesData = data;
    return  {countriesData, jsonRowCount};
}

async function getData(fetchYear) {
    //const {countriesData} = await fetchData();
    countriesData = null;
    if (!countriesData) {
        await fetchData(fetchYear);
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
    console.log("what was year change?"+fetchYear);
    console.log(medalsData);
    return {medalsData, jsonRowCount}
}

async function getTotalMedalsByCountry(countryQuery) {
    try {
        // Fetch the JSON file
        const response = await fetch('totalMedals.json');
        if (!response.ok) {
            throw new Error('Failed to fetch JSON file');
        }
        const medalsData = await response.json();

        // Find data for the specific country
        const countryMedals = medalsData.find(data => data.Country.toLowerCase() === countryQuery.toLowerCase());

        if (countryMedals) {
            console.log(`Medals data for ${countryQuery}:`, countryMedals);
            return {
                gold: countryMedals.TotalGold,
                silver: countryMedals.TotalSilver,
                bronze: countryMedals.TotalBronze,
                total: countryMedals.Total
            };
        } else {
            console.log(`Medals data for ${countryQuery} not found.`);
            return {
                gold: 0,
                silver: 0,
                bronze: 0,
                total: 0
            };
        }
    } catch (error) {
        console.error('Error fetching or parsing JSON:', error);
        return {
            gold: 0,
            silver: 0,
            bronze: 0,
            total: 0
        };
    }
}


async function getNotableAthletes() {
    try {
        // Fetch the JSON file
        const response = await fetch('notableAthletes.json');
        if (!response.ok) {
            throw new Error('Failed to fetch JSON file');
        }
        const athletesData = await response.json();

        // Create an empty object to hold the notable athletes
        const notableAthletes = {};

        // Iterate over the JSON data
        athletesData.forEach(({ country_name, athlete_full_name, athlete_url }) => {
            if (!notableAthletes[country_name]) {
                notableAthletes[country_name] = {
                    athletes: [],
                    urls: []
                };
            }
            notableAthletes[country_name].athletes.push(athlete_full_name);
            notableAthletes[country_name].urls.push(athlete_url);
        });

        console.log(notableAthletes);
        return notableAthletes;
    } catch (error) {
        console.error('Error fetching or parsing JSON:', error);
        return {};
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    

    const tableBody = document.querySelector('#medalsTable tbody');
    const searchCountryInput = document.getElementById('searchCountry');
    const selectYear = document.getElementById('selectYear');

    let currentPage = 1; // Global variable to keep track of the current page

    try {
        // Fetch available years from the backend
        const yearResponse = await fetch('http://127.0.0.1:5000/yearFilter');
        if (!yearResponse.ok) {
            throw new Error('Failed to fetch years');
        }
        const years = await yearResponse.json();

        // Clear any existing options in selectYear
        selectYear.innerHTML = '';

        // Populate the select element with year options
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            selectYear.appendChild(option);
        });

        // Event listener for selectYear and searchCountryInput
        selectYear.addEventListener('change', () => {
            populateTable(selectYear.value, searchCountryInput.value);
        });

        searchCountryInput.addEventListener('input', () => {
            populateTable(selectYear.value, searchCountryInput.value);
        });

        // Initial population of the table
        populateTable(selectYear.value, searchCountryInput.value);

    } catch (error) {
        console.error('Error fetching or parsing years:', error);
    }

async function populateTable(year, searchQuery = '') {
        tableBody.innerHTML = '';

        try {
            const yearString = String(year);
            const { medalsData, jsonRowCount } = await getData(yearString);
            console.log("Total rows from table: ", jsonRowCount);
            const yearData = medalsData[yearString] || [];

            const filteredData = yearData.filter(data =>
                data.country.toLowerCase().includes(searchQuery.toLowerCase())
            );

            const startIndex = (currentPage - 1) * 20;
            const endIndex = startIndex + 20;
            const paginatedData = filteredData.slice(startIndex, endIndex);

            paginatedData.forEach(data => {
                const row = document.createElement('tr');

                for (const key in data) {
                    const cell = document.createElement('td');
                    cell.textContent = data[key];
                    row.appendChild(cell);
                }

                (function(data) {
                    row.addEventListener('click', async () => {
                        const notableAthletes = await getNotableAthletes();
                        const countryName = data.country; // Assuming 'country' is the key for the country name
                        const athletes = notableAthletes[countryName]?.athletes || [];
                        const url_athletes = notableAthletes[countryName]?.urls || [];
                        const totalMedals = countriesData[5];

                        // Fetch country flag
                        try {
                            const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}`);
                            const countryData = await response.json();
                            countryFlag = countryData[0]?.flags?.svg || '';

                            // Fetch total medals for the country
                            const countryMedals = await getTotalMedalsByCountry(countryName);

                            if (countryMedals) {
                                // Store data in localStorage and redirect to country.html
                                localStorage.setItem('countryData', JSON.stringify({
                                    country: countryName,
                                    ...totalMedals,
                                    flag: countryFlag,
                                    athletes: athletes,
                                    urls: url_athletes,
                                    gold: countryMedals.gold,
                                    silver: countryMedals.silver,
                                    bronze: countryMedals.bronze,
                                    total: countryMedals.total,
                                }));
                                window.location.href = 'country.html';
                            } else {
                                alert('Total medals data for this country is not available.');
                            }
                        } catch (error) {
                            console.error('Error fetching country flag:', error);
                        }
                    });
                })(data);

                tableBody.appendChild(row);
            });

            generatePaginationButtons(calculateTotalPages(jsonRowCount));

        } catch (error) {
            console.error('Error populating table:', error);
        }
    }

    // Function to generate pagination buttons
    function generatePaginationButtons(totalPages) {
        const paginationButtonsContainer = document.getElementById('paginationButtons');
        paginationButtonsContainer.innerHTML = '';

        // Create "Previous" button
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Antes';
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
        nextButton.textContent = 'Próximo';
        nextButton.addEventListener('click', () => goToNextPage());
        paginationButtonsContainer.appendChild(nextButton);
    }

    // Function to navigate to previous page
    function goToPreviousPage() {
        if (currentPage > 1) {
            currentPage--;
            populateTable(selectYear.value, searchCountryInput.value);
        }
    }

    // Function to navigate to next page
    function goToNextPage() {
        const totalPages = calculateTotalPages(jsonRowCount);
        if (currentPage < totalPages) {
            currentPage++;
            populateTable(selectYear.value, searchCountryInput.value);
        }
    }

    // Function to navigate to specific page
    function goToPage(page) {
        currentPage = page;
        populateTable(selectYear.value, searchCountryInput.value);
    }

    // Function to calculate total number of pages based on row count
    function calculateTotalPages(rowCountGet) {
        return Math.ceil(rowCountGet / 20); // Assuming 20 rows per page
    }

    // Event listener for search input
    searchCountryInput.addEventListener('input', () => {
        populateTable(selectYear.value, searchCountryInput.value);
    });

    // Event listener for selectYear change
    selectYear.addEventListener('change', () => {
        populateTable(selectYear.value, searchCountryInput.value);
    });

});