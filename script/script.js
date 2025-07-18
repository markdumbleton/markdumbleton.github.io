
// Fix and style first column on scroll
document.addEventListener('DOMContentLoaded', function () {
    const tableContainer = document.querySelector('.table-container');
    const firstColumnCells = document.querySelectorAll('table td:first-child, table th:first-child');

    if (tableContainer) {
        tableContainer.addEventListener('scroll', () => {
            if (tableContainer.scrollLeft > 0) {
                firstColumnCells.forEach(cell => cell.classList.add('scrolled'));
            } else {
                firstColumnCells.forEach(cell => cell.classList.remove('scrolled'));
            }
        });
    }
});

// Check for table overflow
document.addEventListener("DOMContentLoaded", function () {
    const container = document.querySelector(".table-container");
    const table = container.querySelector("table");

    function checkTableOverflow() {
        if (table.offsetWidth > container.clientWidth) {
            console.log("Table is wider than the container.");
            container.classList.add("table-overflow");
        } else {
            console.log("Table fits within the container.");
            container.classList.remove("table-overflow");
        }
    }
    // Run on load and on resize
    checkTableOverflow();
    window.addEventListener("resize", checkTableOverflow);
});

// Sort table columns
document.addEventListener("DOMContentLoaded", function () {
    const table = document.querySelector("table");
    const headers = table.querySelectorAll("th");

    headers.forEach((header, index) => {
        const button = header.querySelector(".button--sort");
        if (!button) return;

        let sortDirection = null;

        button.addEventListener("click", () => {
            const rows = Array.from(table.querySelector("tbody").rows);
            const isNumeric = !isNaN(rows[0].cells[index].textContent.trim());

            if (sortDirection === "asc") {
                sortDirection = "desc";
            } else {
                sortDirection = "asc";
            }

            rows.sort((a, b) => {
                const aText = a.cells[index].textContent.trim();
                const bText = b.cells[index].textContent.trim();

                if (isNumeric) {
                    return sortDirection === "asc"
                        ? parseFloat(aText) - parseFloat(bText)
                        : parseFloat(bText) - parseFloat(aText);
                } else {
                    return sortDirection === "asc"
                        ? aText.localeCompare(bText)
                        : bText.localeCompare(aText);
                }
            });

            const tbody = table.querySelector("tbody");
            tbody.innerHTML = "";
            rows.forEach(row => tbody.appendChild(row));

            // Reset all icons
            document.querySelectorAll(".sort-icon").forEach(icon => {
                icon.classList.remove("sort-asc", "sort-desc");
                icon.classList.add("sort-unsorted");
            });

            // Update current icon
            const icon = button.querySelector(".sort-icon");
            icon.classList.remove("sort-unsorted");
            icon.classList.add(sortDirection === "asc" ? "sort-asc" : "sort-desc");
        });
    });
});


document.addEventListener("DOMContentLoaded", function () {
  const tableBody = document.querySelector("#data-table tbody");
  const pagination = document.getElementById("pagination-controls");
  const rowCount = document.getElementById("row-count");
  const selectAllCheckbox = document.getElementById("select-all");
  const totalSelectedDisplay = document.getElementById("total-selected");
  const selectRemainingBtn = document.getElementById("select-remaining");
  const deselectAllBtn = document.getElementById("deselect-all");
  const rowsPerPageSelect = document.getElementById("rows-per-page");

  let currentPage = 1;
  let rowsPerPage = parseInt(rowsPerPageSelect.value);
  let selectedRows = new Set();
  let filteredRows = Array.from(tableBody.querySelectorAll("tr"));

  const searchInput = document.getElementById("searchInput");

  function applyFiltersAndSearch() {
    const statusFilters = Array.from(document.querySelectorAll('input[name="status"]:checked')).map(cb => cb.value);
    const dateFrom = document.getElementById("dateFrom").value;
    const dateTo = document.getElementById("dateTo").value;
    const searchTerm = searchInput.value.trim().toLowerCase();

    filteredRows = Array.from(tableBody.querySelectorAll("tr")).filter(row => {
      const rowStatus = row.getAttribute("data-status");
      const rowDate = row.getAttribute("data-date");
      const name = row.querySelector('[data-field="name"]')?.textContent.toLowerCase() || "";
      const email = row.querySelector('[data-field="email"]')?.textContent.toLowerCase() || "";
      const teacher = row.querySelector('[data-field="teacher"]')?.textContent.toLowerCase() || "";
      const id = row.querySelector('[data-field="id"]')?.textContent.toLowerCase() || "";
      const sap = row.querySelector('[data-field="sap"]')?.textContent.toLowerCase() || "";

      let show = true;
      if (statusFilters.length > 0 && !statusFilters.includes(rowStatus)) show = false;
      if (dateFrom && rowDate < dateFrom) show = false;
      if (dateTo && rowDate > dateTo) show = false;
      if (searchTerm && !name.includes(searchTerm) && !email.includes(searchTerm) && !teacher.includes(searchTerm) && !id.includes(searchTerm) && !sap.includes(searchTerm)) show = false;

      return show;
    });

    currentPage = 1;
    renderTable();
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyFiltersAndSearch);
  }

  function applyFilters() {
    const statusFilters = Array.from(document.querySelectorAll('input[name="status"]:checked')).map(cb => cb.value);
    const dateFrom = document.getElementById("dateFrom").value;
    const dateTo = document.getElementById("dateTo").value;

    filteredRows = Array.from(tableBody.querySelectorAll("tr")).filter(row => {
      const rowStatus = row.getAttribute("data-status");
      const rowDate = row.getAttribute("data-date");
      let show = true;
      if (statusFilters.length > 0 && !statusFilters.includes(rowStatus)) show = false;
      if (dateFrom && rowDate < dateFrom) show = false;
      if (dateTo && rowDate > dateTo) show = false;
      return show;
    });

    currentPage = 1;
    renderTable();
  }

  function renderTable() {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    Array.from(tableBody.querySelectorAll("tr")).forEach(row => row.style.display = "none");

    filteredRows.forEach((row, index) => {
      row.style.display = index >= start && index < end ? "" : "none";
      const cb = row.querySelector(".row-checkbox");
      if (cb) cb.checked = selectedRows.has(cb.dataset.rowId);
    });

    const noResultsMessage = document.getElementById("no-results-message");
    if (filteredRows.length === 0) {
      noResultsMessage.style.display = "block";
    } else {
      noResultsMessage.style.display = "none";
    }

    updateRowCount();
    updatePagination();
    updateCheckboxStates();
  }

  function updateRowCount() {
    const visibleRows = Math.min(rowsPerPage, filteredRows.length - (currentPage - 1) * rowsPerPage);
    rowCount.textContent = `Showing ${visibleRows} of ${filteredRows.length}`;
  }

  function updatePagination() {
    pagination.innerHTML = "";
    const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

    const createPageButton = (label, page) => {
      const btn = document.createElement("button");
      btn.textContent = label;
      btn.className = "button button--outline";
      if (page === currentPage) btn.classList.add("button--active");
      btn.onclick = () => {
        currentPage = page;
        renderTable();
      };
      return btn;
    };

    if (currentPage > 1) pagination.appendChild(createPageButton("←", currentPage - 1));
    for (let i = 1; i <= totalPages; i++) pagination.appendChild(createPageButton(i, i));
    if (currentPage < totalPages) pagination.appendChild(createPageButton("→", currentPage + 1));
  }

  function updateCheckboxStates() {
    const visibleCheckboxes = filteredRows
      .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
      .map(row => row.querySelector(".row-checkbox"))
      .filter(cb => cb);

    const checkedVisible = visibleCheckboxes.filter(cb => cb.checked).length;

    if (checkedVisible === 0) {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = false;
    } else if (checkedVisible === visibleCheckboxes.length) {
      selectAllCheckbox.checked = true;
      selectAllCheckbox.indeterminate = false;
    } else {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = true;
    }

    totalSelectedDisplay.textContent = `${selectedRows.size} selected:`;
    const remaining = filteredRows.length - selectedRows.size;
    selectRemainingBtn.style.display = selectedRows.size > 0 && remaining > 0 ? "inline-block" : "none";
    selectRemainingBtn.textContent = `Select ${remaining} more`;
    deselectAllBtn.style.display = selectedRows.size > 0 ? "inline-block" : "none";

    // Show and Hide bulk actions
    const bulkActions = document.querySelector(".bulk-actions");
    if (bulkActions) {
      bulkActions.classList.toggle("hidden", selectedRows.size === 0);
    }

  }

  selectAllCheckbox.addEventListener("change", function () {
    const visibleCheckboxes = filteredRows
      .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
      .map(row => row.querySelector(".row-checkbox"))
      .filter(cb => cb);

    visibleCheckboxes.forEach(cb => {
      cb.checked = selectAllCheckbox.checked;
      const id = cb.dataset.rowId;
      if (cb.checked) selectedRows.add(id);
      else selectedRows.delete(id);
    });

    updateCheckboxStates();
  });

  tableBody.addEventListener("change", function (e) {
    if (e.target.classList.contains("row-checkbox")) {
      const id = e.target.dataset.rowId;
      if (e.target.checked) selectedRows.add(id);
      else selectedRows.delete(id);
      updateCheckboxStates();
    }
  });

  selectRemainingBtn.addEventListener("click", function () {
    filteredRows.forEach(row => {
      const cb = row.querySelector(".row-checkbox");
      if (cb) {
        cb.checked = true;
        selectedRows.add(cb.dataset.rowId);
      }
    });
    renderTable();
  });

  deselectAllBtn.addEventListener("click", function () {
    selectedRows.clear();
    filteredRows.forEach(row => {
      const cb = row.querySelector(".row-checkbox");
      if (cb) cb.checked = false;
    });
    renderTable();
  });

  rowsPerPageSelect.addEventListener("change", function () {
    rowsPerPage = parseInt(this.value);
    currentPage = 1;
    renderTable();
  });

  function updateFilterCountBadge() {
  const statusFilters = Array.from(document.querySelectorAll('input[name="status"]:checked'));
  const dateFrom = document.getElementById("dateFrom").value;
  const dateTo = document.getElementById("dateTo").value;

  const filterCount = statusFilters.length + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0);
  const badge = document.getElementById("filterBtn").querySelector(".badge");

  if (badge) {
    if (filterCount > 0) {
      badge.textContent = filterCount;
      badge.style.display = "inline-flex";
    } else {
      badge.style.display = "none";
    }
  }
}


  document.getElementById("applyFilters").addEventListener("click", function () {
    applyFilters();
    updateFilterCountBadge();

    document.getElementById("filterModal").style.display = "none";
  });

  document.getElementById("clearFilters").addEventListener("click", function () {
    document.querySelectorAll('input[name="status"]').forEach(cb => cb.checked = false);
    document.getElementById("dateFrom").value = "";
    document.getElementById("dateTo").value = "";
    document.getElementById("searchInput").value = "";
    filteredRows = Array.from(tableBody.querySelectorAll("tr"));
    currentPage = 1;
    renderTable();
    document.getElementById("filterModal").style.display = "none";
    document.getElementById("filterBtn").querySelector(".badge").style.display = "none";
  });

  applyFilters();
  // updateFilterCountBadge();

});


document.getElementById("filterBtn").addEventListener("click", function () {
  document.getElementById("filterModal").style.display = "flex";
});


document.getElementById("filterBtn").addEventListener("click", function () {
      document.getElementById("filterModal").style.display = "flex";
    });

    document.getElementById("closeFilterModal").addEventListener("click", function () {
      document.getElementById("filterModal").style.display = "none";
    });

    document.getElementById("filterModal").addEventListener("click", function (e) {
      if (e.target === this) {
        this.style.display = "none";
      }
    });

// Menus

const menuButtons = document.querySelectorAll('.menu-button');
let currentPopup = null;
let currentButton = null;

function positionMenu(button, popup, align = 'right') {
  const GAP = 8;

  popup.style.visibility = 'hidden';
  popup.classList.remove('hidden');

  const rect = button.getBoundingClientRect();
  const popupWidth = popup.offsetWidth;
  const popupHeight = popup.offsetHeight;

  const spaceBelow = window.innerHeight - rect.bottom;
  const showAbove = spaceBelow < popupHeight + GAP;

  popup.style.position = 'fixed';

  if (align === 'left') {
    popup.style.left = `${rect.left}px`;
  } else {
    popup.style.left = `${rect.right - popupWidth}px`;
  }

  popup.style.top = showAbove
    ? `${rect.top - popupHeight - GAP}px`
    : `${rect.bottom + GAP}px`;

  popup.style.visibility = 'visible';
}


menuButtons.forEach(button => {
  const popupId = button.dataset.menuId;
  const align = button.dataset.align || 'right';
  const popup = document.getElementById(popupId);

  popup.querySelectorAll('a').forEach(item => {
    item.addEventListener('click', () => {
      popup.classList.add('hidden');
      currentPopup = null;
      currentButton = null;
    });
  });

  button.addEventListener('click', (event) => {
    event.stopPropagation();

    if (currentPopup && currentPopup !== popup) {
      currentPopup.classList.add('hidden');
    }

    if (popup.classList.contains('hidden')) {
      currentPopup = popup;
      currentButton = button;
      positionMenu(button, popup, align);
    } else {
      popup.classList.add('hidden');
      currentPopup = null;
      currentButton = null;
    }
  });
});

document.addEventListener('click', (event) => {
  if (currentPopup && !currentPopup.contains(event.target)) {
    currentPopup.classList.add('hidden');
    currentPopup = null;
    currentButton = null;
  }
});

window.addEventListener('scroll', () => {
  if (currentPopup && currentButton) {
    const align = currentButton.dataset.align || 'right';
    positionMenu(currentButton, currentPopup, align);
  }
});

window.addEventListener('resize', () => {
  if (currentPopup && currentButton) {
    const align = currentButton.dataset.align || 'right';
    positionMenu(currentButton, currentPopup, align);
  }
});

// Lightbox
  document.addEventListener('DOMContentLoaded', () => {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.close-btn');

    document.querySelectorAll('a > img').forEach(img => {
      img.parentElement.addEventListener('click', e => {
        e.preventDefault();
        lightboxImg.src = img.src;
        lightbox.style.display = 'flex';
      });
    });

    closeBtn.addEventListener('click', () => {
      lightbox.style.display = 'none';
    });

    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) {
        lightbox.style.display = 'none';
      }
    });
  });


// Code copied dialogue
  document.addEventListener("DOMContentLoaded", function () {
    const dialog = document.getElementById("copy-dialog");

    function showDialog() {
      dialog.style.display = "block";
      setTimeout(() => {
        dialog.style.display = "none";
      }, 2000);
    }

    function copyText(text) {
      navigator.clipboard.writeText(text).then(showDialog);
    }

    document.getElementById("copy-btn").addEventListener("click", function () {
      copyText("Your code here");
    });

    document.getElementById("copy-link").addEventListener("click", function (e) {
      e.preventDefault(); // Prevent link navigation
      copyText("Your code here");
    });
  });

