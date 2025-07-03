
let siteData =
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
let filteredData = [];
const siteDataById = new Map(siteData.map(item => [item.id, item]))
let db;
const DB_NAME = "SalesDB";
const STORE_NAME = "sales";
let chartInstance = null;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = event => {
      db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = event => {
      db = event.target.result;
      resolve();
    };
    request.onerror = () => reject("IndexedDB init error");
  });
}
function saveToDB(data) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    data.forEach(item => store.put(item));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject("Save to DB failed");
  });
}
function loadFromDB() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("Read from DB failed");
  });
}
function deleteFromDB(id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject("Delete from DB failed");
  });
}
function loadData() {
  openDB().then(() => {
    loadFromDB().then(data => {
      if (data.length === 0) {
        siteData.forEach(item => siteDataById.set(item.id, item));
        saveToDB(siteData).then(() => {
          filteredData = [...siteData];
          displayData(filteredData);
          const departments = [...new Set(siteData.flatMap((x)=>x.department))]
          departments.forEach(item=>{
            const option = document.createElement("option")
            option.value = item;
            option.innerHTML = item;
            document.getElementById("departmentFilter").appendChild(option);
          })
        });
      } else {
        siteData = data;
        siteDataById.clear();
        siteData.forEach(item => siteDataById.set(item.id, item));
        filteredData = [...siteData];
        renderChart("bar");
        displayData(filteredData);
        const departments = [...new Set(siteData.flatMap((x)=>x.department))]
        departments.forEach(item=>{
          const option = document.createElement("option")
          option.value = item;
          option.innerHTML = item;
          document.getElementById("departmentFilter").appendChild(option);
        })
      }
    });
  });
  
}
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

  renderChart(document.getElementById("chartType").value);
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
      input.value = originalValue
      alert("Rok musi być liczbą z zakresu 2000-2100");
      input.focus();
      return;
    }
    newValue = val;
  }
  if (field === "sales") {
    const val = Number(newValue);
    if (isNaN(val) || val < 0) {
      input.value = originalValue
      alert("Sprzedaż musi być liczbą dodatnią lub zerem");
      input.focus();
      return;
    }
    newValue = val;
  }
  if (field === "month") {
    const val = Number(newValue);
    if (val < 1 || val > 12) {
      input.value = originalValue
      alert("Miesiąc musi być w zakresie 1-12");
      input.focus();
      return;
    }
    newValue = val;
  }
  if ((field === "firstName" || field === "lastName" || field === "department") && newValue === "") {
    input.value = originalValue
    alert("To pole nie może być puste");
    input.focus();
    return;
  }

  const index = siteData.findIndex(item => item.id === id);
  if (index > -1) {
    siteData[index][field] = newValue;
  }

  filterData();
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

  const newEntry = {
    firstName,
    lastName,
    department,
    month,
    year,
    sales
  };

  function isDuplicate(a, b) {
    return a.firstName === b.firstName &&
           a.lastName === b.lastName &&
           a.department === b.department &&
           a.month === b.month &&
           a.year === b.year;
  }

  const duplicates = siteData.filter(item => isDuplicate(item, newEntry));

  if (duplicates.length > 0) {
    const action = prompt(
      `Znaleziono ${duplicates.length} duplikat(ów).\n` +
      `Wpisz:\n` +
      `"sumuj" - dodaj sprzedaż\n` +
      `"nadpisz" - zastąp istniejące\n` +
      `"ignoruj" - pomiń importowane duplikaty`
    );

    if (!action || !["sumuj", "nadpisz", "ignoruj"].includes(action.toLowerCase())) {
      alert("Niepoprawna akcja. Operacja anulowana.");
      return;
    }

    const tx = db.transaction("sales", "readwrite");
    const store = tx.objectStore("sales");

    for (const existing of duplicates) {
      if (action.toLowerCase() === "sumuj") {
        existing.sales += newEntry.sales;
        store.put(existing);
      } else if (action.toLowerCase() === "nadpisz") {
        existing.firstName = newEntry.firstName;
        existing.lastName = newEntry.lastName;
        existing.department = newEntry.department;
        existing.month = newEntry.month;
        existing.year = newEntry.year;
        existing.sales = newEntry.sales;
        store.put(existing);
      } else if (action.toLowerCase() === "ignoruj") {
      }
    }

    tx.oncomplete = () => {
      loadFromDB().then(data => {
        siteData = data;
        filterData();
        e.target.reset();
      });
    };

    tx.onerror = () => {
      alert("Wystąpił błąd przy zapisie do IndexedDB.");
    };

  } else {
    const maxId = siteData.reduce((max, item) => item.id > max ? item.id : max, 0);
    newEntry.id = maxId + 1;

    siteData.push(newEntry);

    const tx = db.transaction("sales", "readwrite");
    const store = tx.objectStore("sales");
    store.put(newEntry);

    tx.oncomplete = () => {
      filterData();
      e.target.reset();
    };

    tx.onerror = () => {
      alert("Wystąpił błąd przy zapisie do IndexedDB.");
    };
  }
});


//Usuń
document.getElementById("dataTable").addEventListener("click", function(event) {
  if (event.target.classList.contains("delete-btn")) {
    const id = Number(event.target.getAttribute("data-id"));
    if (confirm("Czy na pewno chcesz usunąć ten wpis?")) {
      const index = siteData.findIndex(item => item.id === id);
      if (index > -1) {
        siteData.splice(index, 1);
        filterData();
      }

      // DELETE from IndexedDB
      const tx = db.transaction("sales", "readwrite");
      const store = tx.objectStore("sales");
      store.delete(id);

      tx.oncomplete = () => {
        console.log(`Wpis ID ${id} został usunięty z IndexedDB`);
      };

      tx.onerror = () => {
        alert("Wystąpił błąd podczas usuwania z IndexedDB.");
      };
    }
  }
});




loadData();
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

//Charts logic
function renderChart(chartType = "bar") {
  const ctx = document.getElementById('salesChart').getContext('2d');
  const grouping = document.getElementById('groupSelect').value;
  const monthsPL = [
    "-", "styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec",
    "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"
  ];

  if (chartInstance) chartInstance.destroy();

  let groupKeyFn;
  let uniqueYears = new Set();
  let isMonthGrouping = false;

  if (grouping === "department") {
    groupKeyFn = item => item.department;
  } else {
    uniqueYears = new Set(filteredData.map(d => d.year));
    if (uniqueYears.size === 1) {
      groupKeyFn = item => item.month;  // use numeric month for sorting
      isMonthGrouping = true;
    } else {
      groupKeyFn = item => item.year;
    }
  }

  const grouped = {};
  filteredData.forEach(entry => {
    const key = groupKeyFn(entry);
    if (!grouped[key]) grouped[key] = 0;
    grouped[key] += entry.sales;
  });

  let labels;
  if (isMonthGrouping) {
    // Sort numerically and convert to Polish month names
    labels = Object.keys(grouped).map(Number).sort((a, b) => a - b);
    labels = labels.map(m => monthsPL[m]);
  } else if (grouping === "time") {
    // Year-based grouping: sort years numerically
    labels = Object.keys(grouped).map(Number).sort((a, b) => a - b).map(String);
  } else {
    // Department or other grouping: sort alphabetically
    labels = Object.keys(grouped).sort();
  }

  const values = labels.map(label => {
    // If month name (from isMonthGrouping), find the month index
    if (isMonthGrouping) {
      const monthIndex = monthsPL.indexOf(label);
      return grouped[monthIndex];
    }
    return grouped[label];
  });

  chartInstance = new Chart(ctx, {
    type: chartType,
    data: {
      labels: labels,
      datasets: [{
        label: 'Sprzedaż',
        data: values,
        backgroundColor: ['#4dc9f6', '#f67019', '#f53794', '#537bc4', '#acc236'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: chartType !== 'bar' && chartType !== 'line'
        },
        tooltip: {
          callbacks: {
            label: context => `${context.label}: ${context.raw}`
          }
        }
      },
      scales: chartType === 'bar' || chartType === 'line' ? {
        y: {
          beginAtZero: true
        }
      } : {}
    }
  });
}

document.getElementById("groupSelect").addEventListener("change", function () {

  renderChart(document.getElementById("chartType").value);
});

document.getElementById("chartType").addEventListener("change", function () {
  renderChart(this.value);
});
//Excel logic
function exportToExcel() {
  const wsData = [
    ["ID", "First Name", "Last Name", "Department", "Month", "Year", "Sales"]
  ];

  filteredData.forEach(item => {
    wsData.push([
      item.id,
      item.firstName,
      item.lastName,
      item.department,
      item.month,
      item.year,
      item.sales
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sprzedaż");

  XLSX.writeFile(wb, "sprzedaz.xlsx");
}
async function importFromExcel(file) {
  const reader = new FileReader();

  function createMappingDialog(excelHeaders, targetFields) {
    return new Promise(resolve => {
      // Tworzymy modal i formularz dynamicznie
      const modal = document.createElement("div");
      modal.style = `
        position: fixed; top:0; left:0; width:100%; height:100%; 
        background: rgba(0,0,0,0.7); display:flex; justify-content:center; align-items:center;
        z-index: 1000;
      `;

      const form = document.createElement("form");
      form.style = `
        background: white; padding: 20px; border-radius: 8px; max-width: 400px;
        max-height: 80vh; overflow-y: auto;
      `;

      form.innerHTML = `<h3>Mapowanie kolumn</h3>
        <p>Wybierz, które kolumny odpowiadają polom danych.</p>`;

      excelHeaders.forEach((header, index) => {
        const label = document.createElement("label");
        label.textContent = `Kolumna "${header}" mapuj na:`;
        label.style = "display:block; margin-top: 10px;";

        const select = document.createElement("select");
        select.name = `map_${index}`;
        select.style = "width: 100%; padding: 5px; margin-top: 4px;";

        const noneOption = document.createElement("option");
        noneOption.value = "";
        noneOption.textContent = "Nie importuj";
        select.appendChild(noneOption);

        targetFields.forEach(field => {
          const option = document.createElement("option");
          option.value = field;
          option.textContent = field;
          select.appendChild(option);
        });

        label.appendChild(select);
        form.appendChild(label);
      });

      const btnSubmit = document.createElement("button");
      btnSubmit.type = "submit";
      btnSubmit.textContent = "Importuj";
      btnSubmit.style = "margin-top: 15px; padding: 8px 12px;";
      form.appendChild(btnSubmit);

      modal.appendChild(form);
      document.body.appendChild(modal);

      form.onsubmit = (ev) => {
        ev.preventDefault();
        const formData = new FormData(form);
        const mapping = {};
        for (const [key, value] of formData.entries()) {
          const idx = parseInt(key.split("_")[1], 10);
          if (value) mapping[idx] = value;
        }
        document.body.removeChild(modal);
        resolve(mapping);
      };
    });
  }

  reader.onload = async (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (json.length === 0) {
      alert("Plik Excel jest pusty.");
      return;
    }

    const excelHeaders = json[0].map(h => h.toString().trim().toLowerCase().replace(" ",""));
    const expectedFields = ["id", "firstname", "lastname", "department", "month", "year", "sales"];

    const headersMatch = expectedFields.every(field => excelHeaders.includes(field));

    let mapping = null;
    if (!headersMatch) {
      mapping = await createMappingDialog(excelHeaders, expectedFields);
    } else {
      mapping = {};
      expectedFields.forEach(field => {
        const idx = excelHeaders.indexOf(field);
        if (idx !== -1) mapping[idx] = field;
      });
    }

    // Parsowanie danych wg mapowania
    const importedData = json.slice(1).map(row => {
      const obj = {};
      for (const [colIndex, field] of Object.entries(mapping)) {
        let value = row[colIndex];

        // Rzutowanie typów dla konkretnych pól
        if (["id", "month", "year", "sales"].includes(field)) {
          value = Number(value);
          if (isNaN(value)) {
            // Jeśli wartość numeryczna niepoprawna, daj null albo 0 w sales
            value = field === "sales" ? 0 : null;
          }
        } else if (typeof value === "undefined" || value === null) {
          value = "";
        }
        obj[field] = value;
      }
      return obj;
    }).filter(item => item.id !== null && !isNaN(item.id));

    function isDuplicate(a, b) {
      return a.firstName === b.firstName &&
             a.lastName === b.lastName &&
             a.department === b.department &&
             a.month === b.month &&
             a.year === b.year;
    }

    const duplicates = [];
    const uniqueImports = [];

    for (const impEntry of importedData) {
      const existing = siteData.find(s => isDuplicate(s, impEntry));
      if (existing) {
        duplicates.push({ existing, incoming: impEntry });
      } else {
        uniqueImports.push(impEntry);
      }
    }

    if (duplicates.length === 0) {
      siteData = [...siteData, ...uniqueImports];
      filteredData = [...siteData];
      await saveToDB(siteData);
      displayData(filteredData);
      renderChart();
      alert("Import zakończony pomyślnie!");
      return;
    }

    const action = prompt(
      `Znaleziono ${duplicates.length} duplikaty.\n` +
      `Wpisz:\n` +
      `"sumuj" - dodaj sprzedaż\n` +
      `"nadpisz" - zastąp istniejące\n` +
      `"ignoruj" - pomiń importowane duplikaty`
    );

    if (!action || !["sumuj", "nadpisz", "ignoruj"].includes(action.toLowerCase())) {
      alert("Niepoprawna akcja. Import anulowany.");
      return;
    }

    for (const { existing, incoming } of duplicates) {
      if (action === "sumuj") {
        existing.sales += incoming.sales;
      } else if (action === "nadpisz") {
        existing.firstName = incoming.firstName;
        existing.lastName = incoming.lastName;
        existing.department = incoming.department;
        existing.month = incoming.month;
        existing.year = incoming.year;
        existing.sales = incoming.sales;
      } else if (action === "ignoruj") {
        // nic nie rób
      }
    }

    siteData = [...siteData, ...uniqueImports];
    filteredData = [...siteData];
    await saveToDB(siteData);
    displayData(filteredData);
    renderChart();
    alert("Import zakończony pomyślnie!");
  };

  reader.readAsArrayBuffer(file);
}


document.getElementById("exportBtn").addEventListener("click", exportToExcel);

document.getElementById("importBtn").addEventListener("click", () => {
  document.getElementById("importInput").click();
});

document.getElementById("importInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) importFromExcel(file);
  e.target.value = ""; 
});