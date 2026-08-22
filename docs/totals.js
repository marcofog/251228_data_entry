const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSgd4irEkNwFAyhRe4cGUmJACJNWEQeUUyaY30QmHKnHymyaXbNgzwWMF9jyJz5tFUIzFRh-rYdntx4/pub?gid=0&single=true&output=csv';

$(document).ready(function() {
    loadData();
});

async function loadData() {
    try {
        const url = CSV_URL + '&t=' + new Date().getTime();
        const response = await fetch(url, {
            cache: 'no-store'
        });
        
        if (!response.ok) {
            throw new Error('Errore nel recupero dei dati');
        }
        
        const csvText = await response.text();
        const records = parseCSV(csvText);
        
        if (records.length > 0) {
            calculateTotals(records);
        } else {
            showError('Nessun dato disponibile');
        }
        
    } catch (error) {
        showError('Errore nel caricamento dei dati: ' + error.message);
    }
}

function parseCSV(csv) {
    const lines = csv.split('\n');
    const records = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());
        
        if (values[0] && values[1]) {
            const importoStr = values[2] ? values[2].replace(',', '.') : '0';
            const importo = parseFloat(importoStr) || 0;
            
            records.push({
                nome: values[1],
                importo: importo
            });
        }
    }
    
    return records;
}

function calculateTotals(records) {
    const totals = {};
    
    records.forEach(record => {
        if (!totals[record.nome]) {
            totals[record.nome] = {
                nome: record.nome,
                totale: 0,
                count: 0
            };
        }
        totals[record.nome].totale += record.importo;
        totals[record.nome].count += 1;
    });
    
    const totalsArray = Object.values(totals).sort((a, b) => b.totale - a.totale);
    
    displayTotals(totalsArray);
}

function displayTotals(totals) {
    const tbody = $('#totalsTable tbody');
    tbody.empty();
    
    let totalGeneral = 0;
    
    totals.forEach(item => {
        const media = item.count > 0 ? item.totale / item.count : 0;
        totalGeneral += item.totale;
        
        const row = `
            <tr>
                <td><strong>${escapeHtml(item.nome)}</strong></td>
                <td class="text-nowrap">€ ${item.totale.toFixed(2)}</td>
                <td class="d-none d-md-table-cell">${item.count}</td>
                <td class="d-none d-md-table-cell text-nowrap">€ ${media.toFixed(2)}</td>
            </tr>
        `;
        tbody.append(row);
    });
    
    const numPeople = totals.length;
    const average = numPeople > 0 ? totalGeneral / numPeople : 0;
    
    $('#total-general').text('€ ' + totalGeneral.toFixed(2));
    $('#total-people').text(numPeople);
    $('#average-person').text('€ ' + average.toFixed(2));
    
    $('#loading').hide();
    $('#summary-container').show();
    
    $('#totalsTable').DataTable({
        order: [[1, 'desc']],
        responsive: true,
        language: {
            search: "Cerca:",
            lengthMenu: "Mostra _MENU_",
            info: "_START_-_END_ di _TOTAL_",
            infoEmpty: "Nessuna persona",
            infoFiltered: "(filtrati da _MAX_)",
            paginate: {
                first: "Primo",
                last: "Ultimo",
                next: "›",
                previous: "‹"
            },
            zeroRecords: "Nessuna persona trovata"
        },
        pageLength: 25
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    $('#loading').hide();
    $('#error-message').text(message).show();
}