function filterWords() {
  // Get the input value
  let input = document.getElementById("searchInput").value.toLowerCase();

  // Normalize the input to handle variations of 'a'
  let normalizedInput = normalizeString(input);

  let table = document.getElementById("vocabularyTable");
  let tr = table.getElementsByTagName("tr");

  // Loop through all table rows, and hide those that don't match the query
  for (let i = 1; i < tr.length; i++) { // Start from 1 to skip the header row
    let farsiCell = tr[i].getElementsByTagName("td")[0];
    let transliterationCell = tr[i].getElementsByTagName("td")[1];
    let frenchCell = tr[i].getElementsByTagName("td")[2];

    // Get the text content of each column
    let farsiText = farsiCell.textContent || farsiCell.innerText;
    let transliterationText = transliterationCell.textContent ||
      transliterationCell.innerText;
    let frenchText = frenchCell.textContent || frenchCell.innerText;

    // Normalize the texts for comparison
    let normalizedFarsi = normalizeString(farsiText);
    let normalizedTransliteration = normalizeString(transliterationText);
    let normalizedFrench = normalizeString(frenchText);

    // Check if any of the normalized columns match the normalized input
    if (
      normalizedFarsi.indexOf(normalizedInput) > -1 ||
      normalizedTransliteration.indexOf(normalizedInput) > -1 ||
      normalizedFrench.indexOf(normalizedInput) > -1
    ) {
      tr[i].style.display = ""; // Show row if it matches the search
    } else {
      tr[i].style.display = "none"; // Hide row if it doesn't match the search
    }
  }
}

// Function to normalize strings: Replace accented characters with their unaccented equivalents
function normalizeString(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/â|ā/g, "a") // Replace 'â' and 'ā' with 'a'
    .toLowerCase(); // Ensure comparison is case-insensitive
}
