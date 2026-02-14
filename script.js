let items = [];

/* Add item */
function addItem(){
  const item = document.getElementById("item").value;
  const qty = document.getElementById("qty").value;
  const unit = document.getElementById("unit").value;

  if(!item || !qty || !unit){
    alert("सभी जानकारी भरें");
    return;
  }

  items.push({item, qty, unit});
  render();

  document.getElementById("item").selectedIndex = 0;
  document.getElementById("qty").value = "";
  document.getElementById("unit").selectedIndex = 0;
}

/* Render table */
function render(){
  const tbody = document.getElementById("list");
  tbody.innerHTML = "";

  items.forEach((r,i)=>{
    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${r.item}</td>
        <td>${r.qty} ${r.unit}</td>
        <td class="no-print"><button onclick="removeItem(${i})">❌</button></td>
      </tr>
    `;
  });
}

/* Remove row */
function removeItem(i){
  items.splice(i,1);
  render();
}

/* Custom item */
function addCustom(){
  const val = document.getElementById("customItem").value.trim();
  if(!val) return alert("नाम लिखें");

  const sel = document.getElementById("item");
  if([...sel.options].some(o=>o.value===val)){
    alert("पहले से मौजूद");
    return;
  }

  sel.add(new Option(val,val));
  document.getElementById("customItem").value="";
}

function removeCustom(){
  const sel = document.getElementById("item");
  if(sel.selectedIndex<=0) return alert("कोई सामान चुनें");
  sel.remove(sel.selectedIndex);
}

/* PDF */
function generatePDF() {

  if (items.length === 0) {
    alert("लिस्ट खाली है");
    return;
  }

  const months = ["जनवरी","फरवरी","मार्च","अप्रैल","मई","जून","जुलाई","अगस्त","सितंबर","अक्टूबर","नवंबर","दिसंबर"];
  const d = new Date();
  const monthYear = `${months[d.getMonth()]} ${d.getFullYear()}`;
  document.getElementById("monthYear").innerText = `${monthYear} की सूची`;

  const original = document.getElementById("pdfContent");
  const clone = original.cloneNode(true);

  clone.querySelectorAll(".no-print").forEach(el => el.remove());

  const table = clone.querySelector("table");
  const rows = Array.from(table.querySelectorAll("tbody tr"));
  const thead = table.querySelector("thead").cloneNode(true);
  const headerSection = clone.querySelector(".pdfHeader").cloneNode(true);

  const container = document.createElement("div");

  const rowsPerPage = 19;
  let pageIndex = 0;

  while (pageIndex < rows.length) {

    const pageDiv = document.createElement("div");
    pageDiv.style.pageBreakAfter = "always";

    pageDiv.appendChild(headerSection.cloneNode(true));

    const newTable = document.createElement("table");
    newTable.style.width = "100%";
    newTable.style.borderCollapse = "collapse";

    newTable.appendChild(thead.cloneNode(true));

    const newTbody = document.createElement("tbody");
    newTable.appendChild(newTbody);

    const sliceRows = rows.slice(pageIndex, pageIndex + rowsPerPage);
    sliceRows.forEach(r => newTbody.appendChild(r.cloneNode(true)));

    pageDiv.appendChild(newTable);

    // Footer only on last page
    if (pageIndex + rowsPerPage >= rows.length) {
      const footer = document.createElement("div");
      footer.style.marginTop = "30px";
      footer.style.display = "flex";
      footer.style.justifyContent = "space-between";
      footer.style.padding = "0 20px";

      footer.innerHTML = `
        <div style="text-align:center;">
          <p>Prepared By</p>
          <p><b>Store Keeper</b></p>
        </div>
        <div style="text-align:center;">
          <p>Checked By</p>
          <p>____________________</p>
        </div>
        <div style="text-align:center;">
          <p>Signed By</p>
          <p>____________________</p>
        </div>
      `;

      pageDiv.appendChild(footer);
    }

    container.appendChild(pageDiv);
    pageIndex += rowsPerPage;
  }

  html2pdf()
    .set({
      filename: "kirana-list.pdf",
      margin: [20, 10, 20, 10],
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    })
    .from(container)
    .toPdf()
    .get('pdf')
    .then(function (pdf) {

      const totalPages = pdf.internal.getNumberOfPages();

      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.text(
          `Page ${i} of ${totalPages}`,
          pdf.internal.pageSize.getWidth() / 2,
          pdf.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

    })
    .save();
}
