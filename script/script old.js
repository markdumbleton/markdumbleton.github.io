
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

// Pagination and counts
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
  const allRows = Array.from(tableBody.querySelectorAll("tr"));
  const totalRows = allRows.length;
  const selectedRows = new Set();

  function renderTable() {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    allRows.forEach((row, index) => {
      row.style.display = index >= start && index < end ? "" : "none";
    });

    updateRowCount();
    updatePagination();
    updateCheckboxStates();
  }

  function updateRowCount() {
    const visibleRows = Math.min(rowsPerPage, totalRows - (currentPage - 1) * rowsPerPage);
    rowCount.textContent = `Showing ${visibleRows} of ${totalRows}`;
  }

  function updatePagination() {
    pagination.innerHTML = "";
    const totalPages = Math.ceil(totalRows / rowsPerPage);

    const leftArrow = document.createElement("button");
    leftArrow.textContent = "←";
    leftArrow.className = "page-btn";
    if (currentPage === 1) leftArrow.classList.add("disabled");
    leftArrow.onclick = () => {
      if (currentPage > 1) {
        currentPage--;
        renderTable();
      }
    };
    pagination.appendChild(leftArrow);

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.className = "page-btn";
      if (i === currentPage) btn.classList.add("active");
      btn.onclick = () => {
        currentPage = i;
        renderTable();
      };
      pagination.appendChild(btn);
    }

    const rightArrow = document.createElement("button");
    rightArrow.textContent = "→";
    rightArrow.className = "page-btn";
    if (currentPage === totalPages) rightArrow.classList.add("disabled");
    rightArrow.onclick = () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderTable();
      }
    };
    pagination.appendChild(rightArrow);
  }

  function updateCheckboxStates() {
    const visibleCheckboxes = Array.from(tableBody.querySelectorAll("tr"))
      .filter(row => row.style.display !== "none")
      .map(row => row.querySelector(".row-checkbox"));

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

    const totalSelected = selectedRows.size;
    totalSelectedDisplay.textContent = `Total selected: ${totalSelected}`;

    const remaining = totalRows - totalSelected;
    if (totalSelected > 0 && remaining > 0) {
      selectRemainingBtn.style.display = "inline-block";
      selectRemainingBtn.textContent = `Select ${remaining} more`;
    } else {
      selectRemainingBtn.style.display = "none";
    }

    deselectAllBtn.style.display = totalSelected > 0 ? "inline-block" : "none";
  }

  selectAllCheckbox.addEventListener("change", function () {
    const visibleCheckboxes = Array.from(tableBody.querySelectorAll("tr"))
      .filter(row => row.style.display !== "none")
      .map(row => row.querySelector(".row-checkbox"));

    visibleCheckboxes.forEach(cb => {
      cb.checked = selectAllCheckbox.checked;
      const rowId = cb.dataset.rowId;
      if (cb.checked) {
        selectedRows.add(rowId);
      } else {
        selectedRows.delete(rowId);
      }
    });

    updateCheckboxStates();
  });

  tableBody.addEventListener("change", function (e) {
    if (e.target.classList.contains("row-checkbox")) {
      const rowId = e.target.dataset.rowId;
      if (e.target.checked) {
        selectedRows.add(rowId);
      } else {
        selectedRows.delete(rowId);
      }
      updateCheckboxStates();
    }
  });

  selectRemainingBtn.addEventListener("click", function () {
    allRows.forEach(row => {
      const cb = row.querySelector(".row-checkbox");
      if (cb) {
        cb.checked = true;
        selectedRows.add(cb.dataset.rowId);
      }
    });
    updateCheckboxStates();
  });

  deselectAllBtn.addEventListener("click", function () {
    allRows.forEach(row => {
      const cb = row.querySelector(".row-checkbox");
      if (cb) {
        cb.checked = false;
      }
    });
    selectedRows.clear();
    updateCheckboxStates();
  });

  rowsPerPageSelect.addEventListener("change", function () {
    rowsPerPage = parseInt(this.value);
    currentPage = 1;
    renderTable();
  });

  renderTable();
});

// Select all
document.addEventListener("DOMContentLoaded", function () {
  const rowsPerPage = 15;
  const totalRows = document.querySelectorAll("#data-table tbody tr").length;
  const tableBody = document.querySelector("#data-table tbody");
  const pagination = document.getElementById("pagination-controls");
  const rowCount = document.getElementById("row-count");
  const selectAllCheckbox = document.getElementById("select-all");
  const totalSelectedDisplay = document.getElementById("total-selected");
  const selectRemainingBtn = document.getElementById("select-remaining");
  const deselectAllBtn = document.getElementById("deselect-all");

  let currentPage = 1;
  let selectedIds = new Set();

  function renderTable() {
    const rows = Array.from(tableBody.querySelectorAll("tr"));
    const start = (currentPage - 1) * rowsPerPage;
    const end = Math.min(start + rowsPerPage, totalRows);
    const rowsInView = end - start;

    rows.forEach((row, index) => {
      if (index >= start && index < end) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }

      const checkbox = row.querySelector(".row-checkbox");
      if (checkbox) {
        const id = checkbox.dataset.rowId;
        checkbox.checked = selectedIds.has(id);
      }
    });

    rowCount.textContent = `Showing ${rowsInView} of ${totalRows}`;
    updateSelectAllCheckbox();
    updateSelectionUI();
    renderPagination();
  }

  function renderPagination() {
    pagination.innerHTML = "";
    const totalPages = Math.ceil(totalRows / rowsPerPage);

    const leftArrow = document.createElement("button");
    leftArrow.textContent = "←";
    leftArrow.className = "page-btn";
    if (currentPage === 1) leftArrow.classList.add("disabled");
    leftArrow.onclick = () => {
      if (currentPage > 1) {
        currentPage--;
        renderTable();
      }
    };
    pagination.appendChild(leftArrow);

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.className = "page-btn";
      if (i === currentPage) btn.classList.add("active");
      btn.onclick = () => {
        currentPage = i;
        renderTable();
      };
      pagination.appendChild(btn);
    }

    const rightArrow = document.createElement("button");
    rightArrow.textContent = "→";
    rightArrow.className = "page-btn";
    if (currentPage === totalPages) rightArrow.classList.add("disabled");
    rightArrow.onclick = () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderTable();
      }
    };
    pagination.appendChild(rightArrow);
  }

  function updateSelectAllCheckbox() {
    const visibleCheckboxes = Array.from(tableBody.querySelectorAll("tr"))
      .filter((row, index) => {
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return index >= start && index < end;
      })
      .map(row => row.querySelector(".row-checkbox"))
      .filter(cb => cb);

    const checkedCount = visibleCheckboxes.filter(cb => cb.checked).length;

    if (checkedCount === 0) {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = false;
    } else if (checkedCount === visibleCheckboxes.length) {
      selectAllCheckbox.checked = true;
      selectAllCheckbox.indeterminate = false;
    } else {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = true;
    }
  }

  function updateSelectionUI() {
    const totalSelected = selectedIds.size;
    totalSelectedDisplay.textContent = `Total selected: ${totalSelected}`;

    const remaining = totalRows - totalSelected;
    if (totalSelected > 0 && remaining > 0) {
      selectRemainingBtn.style.display = "inline-block";
      selectRemainingBtn.textContent = `Select ${remaining} more`;
    } else {
      selectRemainingBtn.style.display = "none";
    }

    deselectAllBtn.style.display = totalSelected > 0 ? "inline-block" : "none";
  }

  tableBody.addEventListener("change", function (e) {
    if (e.target.classList.contains("row-checkbox")) {
      const id = e.target.dataset.rowId;
      if (e.target.checked) {
        selectedIds.add(id);
      } else {
        selectedIds.delete(id);
      }
      updateSelectAllCheckbox();
      updateSelectionUI();
    }
  });

  selectAllCheckbox.addEventListener("change", function () {
    const rows = Array.from(tableBody.querySelectorAll("tr"));
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    for (let i = start; i < end && i < rows.length; i++) {
      const checkbox = rows[i].querySelector(".row-checkbox");
      if (checkbox) {
        checkbox.checked = selectAllCheckbox.checked;
        const id = checkbox.dataset.rowId;
        if (selectAllCheckbox.checked) {
          selectedIds.add(id);
        } else {
          selectedIds.delete(id);
        }
      }
    }

    updateSelectAllCheckbox();
    updateSelectionUI();
  });

  selectRemainingBtn.addEventListener("click", function () {
    const checkboxes = tableBody.querySelectorAll(".row-checkbox");
    checkboxes.forEach(cb => {
      cb.checked = true;
      selectedIds.add(cb.dataset.rowId);
    });
    updateSelectAllCheckbox();
    updateSelectionUI();
  });

  deselectAllBtn.addEventListener("click", function () {
    selectedIds.clear();
    const checkboxes = tableBody.querySelectorAll(".row-checkbox");
    checkboxes.forEach(cb => {
      cb.checked = false;
    });
    updateSelectAllCheckbox();
    updateSelectionUI();
  });

  renderTable();
});

// Lightbox for book covers
document.querySelectorAll('.thumbnail').forEach(img => {
  img.addEventListener('click', function() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    lightboxImg.src = this.src;
    lightbox.style.display = 'flex';
  });
});

document.getElementById('lightbox-close').addEventListener('click', function() {
  document.getElementById('lightbox').style.display = 'none';
});

document.getElementById('lightbox').addEventListener('click', function(e) {
  if (e.target === this) {
    this.style.display = 'none';
  }
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.getElementById('lightbox').style.display = 'none';
  }
});

// Filters
document.getElementById("filterBtn").addEventListener("click", function() {
    document.getElementById("filterModal").style.display = "flex";
});

document.getElementById("applyFilters").addEventListener("click", function() {
    const statusFilters = Array.from(document.querySelectorAll('input[name="status"]:checked')).map(cb => cb.value);
    const dateFrom = document.getElementById("dateFrom").value;
    const dateTo = document.getElementById("dateTo").value;
    const rows = document.querySelectorAll("#data-table tbody tr");
    let visibleCount = 0;

    rows.forEach(row => {
        const rowStatus = row.getAttribute("data-status");
        const rowDate = row.getAttribute("data-date");
        let show = true;

        if (statusFilters.length > 0 && !statusFilters.includes(rowStatus)) {
            show = false;
        }

        if (dateFrom && rowDate < dateFrom) {
            show = false;
        }

        if (dateTo && rowDate > dateTo) {
            show = false;
        }

        row.style.display = show ? "" : "none";
        if (show) visibleCount++;
    });

    const total = rows.length;
    document.getElementById("resultCount").textContent = `${visibleCount} results (out of ${total})`;

    const filterCount = statusFilters.length + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0);
    const badge = document.getElementById("filterCount");
    if (filterCount > 0) {
        badge.textContent = filterCount;
        badge.style.display = "inline-block";
    } else {
        badge.style.display = "none";
    }

    document.getElementById("filterModal").style.display = "none";
});

document.getElementById("clearFilters").addEventListener("click", function() {
    document.querySelectorAll('input[name="status"]').forEach(cb => cb.checked = false);
    document.getElementById("dateFrom").value = "";
    document.getElementById("dateTo").value = "";
    document.querySelectorAll("#data-table tbody tr").forEach(row => row.style.display = "");
    document.getElementById("resultCount").textContent = "20 results (out of 20)";
    document.getElementById("filterCount").style.display = "none";
    document.getElementById("filterModal").style.display = "none";
});
