async function fetchData() {
    const response = await fetch("http://127.0.0.1:5000/data");
    const data = await response.json();
    return data;
}

async function getData() {
    const countriesData = await fetchData();
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

    return {medalsData, countriesDataLength: countriesData.length};
}

console.log(data);