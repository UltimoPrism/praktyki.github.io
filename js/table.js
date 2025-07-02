
const siteData =
[
  {
    "id": 1,
    "firstName": "Anna",
    "lastName": "Nowak",
    "department": "Sprzedaż",
    "month": 1,
    "year": 2025,
    "sales": 10500
  },
  {
    "id": 2,
    "firstName": "Jan",
    "lastName": "Kowalski",
    "department": "Marketing",
    "month": 2,
    "year": 2025,
    "sales": 8700
  },
  {
    "id": 3,
    "firstName": "Katarzyna",
    "lastName": "Wiśniewska",
    "department": "HR",
    "month": 3,
    "year": 2025,
    "sales": 0
  },
  {
    "id": 4,
    "firstName": "Tomasz",
    "lastName": "Dąbrowski",
    "department": "IT",
    "month": 4,
    "year": 2025,
    "sales": 5000
  },
  {
    "id": 5,
    "firstName": "Ewa",
    "lastName": "Zielińska",
    "department": "Sprzedaż",
    "month": 5,
    "year": 2025,
    "sales": 11200
  },
  {
    "id": 6,
    "firstName": "Piotr",
    "lastName": "Szymański",
    "department": "Marketing",
    "month": 6,
    "year": 2025,
    "sales": 9600
  },
  {
    "id": 7,
    "firstName": "Maria",
    "lastName": "Woźniak",
    "department": "Logistyka",
    "month": 7,
    "year": 2025,
    "sales": 7300
  },
  {
    "id": 8,
    "firstName": "Paweł",
    "lastName": "Kaczmarek",
    "department": "Sprzedaż",
    "month": 8,
    "year": 2025,
    "sales": 11800
  },
  {
    "id": 9,
    "firstName": "Agnieszka",
    "lastName": "Mazur",
    "department": "IT",
    "month": 9,
    "year": 2025,
    "sales": 5400
  },
  {
    "id": 10,
    "firstName": "Marek",
    "lastName": "Kubiak",
    "department": "Finanse",
    "month": 10,
    "year": 2025,
    "sales": 8800
  }
]


//Debugging
const departments = [...new Set(siteData.flatMap((x)=>x.department))]
departments.forEach(item=>{
  const option = document.createElement("option")
  option.value = item;
  option.innerHTML = item;
  const option2 = document.createElement("option")
  option2.value = item;
  option2.innerHTML = item;      
  document.getElementById("addDepartment").appendChild(option);
  document.getElementById("departmentFilter").appendChild(option2);
})

function downloadData() {
  fetch("", {
    method: "GET",
    headers: {
      "Accept": "application/json"
    }
  })
  .then(response => {
    if (!response.ok) throw new Error("Network response was not ok");
    return response.json();
  })
  .then(data => {
    if (!Array.isArray(data)) {
      throw new Error("Downloaded data is not an array");
    }
    siteData.length = 0;
    siteData.push(...data);
    filteredData = [...data];
    currentSort = {};
    const departments = [...new Set(siteData.flatMap((x)=>x.department))]
    departments.forEach(item=>{
      const option = document.createElement("option")
      option.value = item;
      option.innerHTML = item;
      const option2 = document.createElement("option")
      option2.value = item;
      option2.innerHTML = item;      
      document.getElementById("addDepartment").appendChild(option);
      document.getElementById("departmentFilter").appendChild(option2);
    })
    displayData(filteredData);
  })
  .catch(error => {
    alert("Error downloading data: " + error.message);
  });
}

let filteredData = [...siteData];

function updateButtonStates(activeField) {
    const buttons = document.querySelectorAll("th button");
    buttons.forEach(btn => btn.classList.remove("active"));

    const buttonMap = {
    firstName: "firstNameId",
    lastName: "lastNameId",
    department: "departmentId",
    month: "monthId",
    year: "yearId",
    sales: "salesId"
    };

    document.getElementById(buttonMap[activeField]).classList.add("active");
}

let currentSort = {};
function sortDataBy(field) {
    const isAsc = currentSort[field] !== true;
    document.getElementById(field+"Id").innerHTML = isAsc?"^":"v"
    filteredData.sort((a, b) => {
    if (typeof a[field] === 'string') {
        return isAsc
        ? a[field].localeCompare(b[field])
        : b[field].localeCompare(a[field]);
    } else {
        return isAsc ? a[field] - b[field] : b[field] - a[field];
    }
    });
    currentSort = { [field]: isAsc };
    updateButtonStates(field);
    displayData(filteredData);
}

function filterData() {
  const nameFilter = document.getElementById("nameFilter").value.toLowerCase().trim();
  const departmentFilter = document.getElementById("departmentFilter").value;
  const monthFilter = document.getElementById("monthFilter").value;
  const yearFilter = document.getElementById("yearFilter").value;
  const minSales = document.getElementById("minSalesFilter").value;
  const maxSales = document.getElementById("maxSalesFilter").value;

  filteredData = siteData.filter(item => {
    // Imię i nazwisko filter (both combined)
    const fullName = (item.firstName + " " + item.lastName).toLowerCase();
    if (nameFilter && !fullName.includes(nameFilter)) {
      return false;
    }
    // Dział filter
    if (departmentFilter && item.department !== departmentFilter) {
      return false;
    }
    // Miesiąc filter
    if (monthFilter && item.month !== Number(monthFilter)) {
      return false;
    }
    // Rok filter
    if (yearFilter && item.year !== Number(yearFilter)) {
      return false;
    }
    // Zakres sprzedaży filter (min & max)
    if (minSales && item.sales < Number(minSales)) {
      return false;
    }
    if (maxSales && item.sales > Number(maxSales)) {
      return false;
    }
    return true;
  });

  // Apply current sorting on filtered data if any
  if(Object.keys(currentSort).length) {
    const field = Object.keys(currentSort)[0];
    const isAsc = currentSort[field];
    filteredData.sort((a, b) => {
      if (typeof a[field] === 'string') {
        return isAsc
          ? a[field].localeCompare(b[field])
          : b[field].localeCompare(a[field]);
      } else {
        return isAsc ? a[field] - b[field] : b[field] - a[field];
      }
    });
  }

  displayData(filteredData);
}

function displayData(data) {
const monthsPL = [
    "-",
  "styczeń",
  "luty",
  "marzec",
  "kwiecień",
  "maj",
  "czerwiec",
  "lipiec",
  "sierpień",
  "wrzesień",
  "październik",
  "listopad",
  "grudzień"
];

    const tbody = document.getElementById("dataTable");
    tbody.innerHTML = ""; // Clear previous content

    data.forEach(item => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td class="editable" data-field="firstName" data-id="${item.id}">${item.firstName}</td>
        <td class="editable" data-field="lastName" data-id="${item.id}">${item.lastName}</td>
        <td class="editable" data-field="department" data-id="${item.id}">${item.department}</td>
        <td class="editable" data-field="month" data-id="${item.id}" data-value="${item.month}">${monthsPL[item.month]}</td>
        <td class="editable" data-field="year" data-id="${item.id}">${item.year}</td>
        <td class="editable" data-field="sales" data-id="${item.id}">${item.sales}</td>
        <td>
          <button class="btn btn-danger btn-sm delete-btn" data-id="${item.id}">Usuń</button>
        </td>
      `;

      tbody.appendChild(row);
    });
    addInlineEditListeners();
    // Calculate sum of sales
    const totalSales = data.reduce((sum, item) => sum + item.sales, 0);

    // Add summary row
    const summaryRow = document.createElement("tr");
    summaryRow.innerHTML = `
      <td colspan="5" style="text-align: right; font-weight: bold;">Suma sprzedaży:</td>
      <td style="font-weight: bold;">= ${totalSales}</td>
    `;
    tbody.appendChild(summaryRow);
}

function addInlineEditListeners() {
  const editableCells = document.querySelectorAll("td.editable");
  editableCells.forEach(cell => {
    cell.onclick = () => {
      if (cell.querySelector("input") || cell.querySelector("select")) return; // Already editing

      const field = cell.dataset.field;
      const id = Number(cell.dataset.id);
      const originalValue = field === "month" ? cell.dataset.value : cell.textContent;
      cell.innerHTML = "";

      let inputElement;
      if (field === "department") {
        // Create select for department
        inputElement = document.createElement("select");
        const departments = [...new Set(siteData.map(x => x.department))];
        departments.forEach(dept => {
          const option = document.createElement("option");
          option.value = dept;
          option.textContent = dept;
          if (dept === originalValue) option.selected = true;
          inputElement.appendChild(option);
        });
      } else if (field === "month") {
        // Create select for month
        inputElement = document.createElement("select");
        const monthsPL = [
          "styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec",
          "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"
        ];
        monthsPL.forEach((m, i) => {
          const option = document.createElement("option");
          option.value = i + 1;
          option.textContent = m;
          if (Number(originalValue) === i + 1) option.selected = true;
          inputElement.appendChild(option);
        });
      } else if (field === "year" || field === "sales") {
        inputElement = document.createElement("input");
        inputElement.type = "number";
        inputElement.value = originalValue;
        if (field === "year") {
          inputElement.min = 2000;
          inputElement.max = 2100;
        } else if (field === "sales") {
          inputElement.min = 0;
        }
      } else {
        inputElement = document.createElement("input");
        inputElement.type = "text";
        inputElement.value = originalValue;
      }

      inputElement.classList.add("edit-input");
      cell.appendChild(inputElement);
      inputElement.focus();

      inputElement.onblur = () => finishEditing(cell, inputElement, field, id, originalValue);
      inputElement.onkeydown = (e) => {
        if (e.key === "Enter") {
          inputElement.blur();
        }
        if (e.key === "Escape") {
          cell.textContent = originalValue;
        }
      };
    };
  });
}

function finishEditing(cell, input, field, id, originalValue) {
  let newValue = input.value.trim();

  // Validation
  if (field === "year") {
    const val = Number(newValue);
    if (!val || val < 2000 || val > 2100) {
      alert("Rok musi być liczbą z zakresu 2000-2100");
      input.focus();
      return;
    }
    newValue = val;
  }
  if (field === "sales") {
    const val = Number(newValue);
    if (isNaN(val) || val < 0) {
      alert("Sprzedaż musi być liczbą dodatnią lub zerem");
      input.focus();
      return;
    }
    newValue = val;
  }
  if (field === "month") {
    const val = Number(newValue);
    if (val < 1 || val > 12) {
      alert("Miesiąc musi być w zakresie 1-12");
      input.focus();
      return;
    }
    newValue = val;
  }
  if ((field === "firstName" || field === "lastName" || field === "department") && newValue === "") {
    alert("To pole nie może być puste");
    input.focus();
    return;
  }

  // Update data in siteData
  const index = siteData.findIndex(item => item.id === id);
  if (index > -1) {
    siteData[index][field] = newValue;
  }

  // Re-filter and display updated data
  filterData();

  // Send update to server using fetch (POST to blank address)
  fetch("", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ id, field, newValue })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json(); // assuming server replies with JSON
  })
  .then(data => {
    console.log("Update successful:", data);
  })
  .catch(error => {
    console.error("Update failed:", error);
  });
}
//Dodaj
document.getElementById("addEntryForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const firstName = document.getElementById("addFirstName").value.trim();
  const lastName = document.getElementById("addLastName").value.trim();
  const department = document.getElementById("addDepartment").value;
  const month = Number(document.getElementById("addMonth").value);
  const year = Number(document.getElementById("addYear").value);
  const sales = Number(document.getElementById("addSales").value);

  if (!firstName || !lastName || !department || !month || !year || isNaN(sales)) {
    alert("Proszę wypełnić wszystkie pola poprawnie.");
    return;
  }
  if (year < 2000 || year > 2100) {
    alert("Rok musi być z zakresu 2000-2100.");
    return;
  }
  if (sales < 0) {
    alert("Sprzedaż musi być liczbą nieujemną.");
    return;
  }

  const maxId = siteData.reduce((max, item) => item.id > max ? item.id : max, 0);
  const newEntry = {
    id: maxId + 1,
    firstName,
    lastName,
    department,
    month,
    year,
    sales
  };
  //Debugging
  siteData.push(newEntry);
  filterData();
  e.target.reset();
  // Wyślij dane do pustego adresu
  fetch("", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newEntry)
  })
  .then(response => {
    if (!response.ok) throw new Error("Błąd sieci");
  })
  .then(() => {
    siteData.push(newEntry);
    filterData();
    e.target.reset();
  })
  .catch(err => {
    alert("Wystąpił błąd przy wysyłaniu danych: " + err.message);
  });
});
//Usuń
document.getElementById("dataTable").addEventListener("click", function(event) {
  if (event.target.classList.contains("delete-btn")) {
    const id = Number(event.target.getAttribute("data-id"));
    if (confirm("Czy na pewno chcesz usunąć ten wpis?")) {
      //Debugging
      const index = sampleData.findIndex(item => item.id === id);
      if (index > -1) {
        siteData.splice(index, 1);
        filterData();
      }
      fetch(""+id, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })
      .then(response => {
        if (!response.ok) throw new Error("Błąd podczas usuwania");
        const index = sampleData.findIndex(item => item.id === id);
        if (index > -1) {
          siteData.splice(index, 1);
          filterData();
        }
      })
      .catch(err => alert("Nie udało się usunąć wpisu: " + err.message));
    }
  }
});




// Call the function on page load
displayData(filteredData);
document.getElementById("firstNameId").addEventListener("click", () => sortDataBy("firstName"));
document.getElementById("lastNameId").addEventListener("click", () => sortDataBy("lastName"));
document.getElementById("departmentId").addEventListener("click", () => sortDataBy("department"));
document.getElementById("monthId").addEventListener("click", () => sortDataBy("month"));
document.getElementById("yearId").addEventListener("click", () => sortDataBy("year"));
document.getElementById("salesId").addEventListener("click", () => sortDataBy("sales"));

document.getElementById("nameFilter").addEventListener("input", filterData);
document.getElementById("departmentFilter").addEventListener("change", filterData);
document.getElementById("monthFilter").addEventListener("change", filterData);
document.getElementById("yearFilter").addEventListener("input", filterData);
document.getElementById("minSalesFilter").addEventListener("input", filterData);
document.getElementById("maxSalesFilter").addEventListener("input", filterData);
