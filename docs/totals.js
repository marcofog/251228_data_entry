const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSgd4irEkNwFAyhRe4cGUmJACJNWEQeUUyaY30QmHKnHymyaXbNgzwWMF9jyJz5tFUIzFRh-rYdntx4/pub?gid=0&single=true&output=csv';

$(document).ready(function() {
    loadData();
});

async function loadData() {
    try {
        const response = await fetch(CSV_URL);
        
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
    
    for (let i = 0; i < lines.length; i++) {
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
            // Estrai l'importo dalla colonna email (assumendo che contenga numeri)
            const importo = parseFloat(values[2]) || 0;
            
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
                <td>€ ${item.totale.toFixed(2)}</td>
                <td>${item.count}</td>
                <td>€ ${media.toFixed(2)}</td>
            </tr>
        `;
        tbody.append(row);
    });
    
    // Aggiorna i totali generali
    const numPeople = totals.length;
    const average = numPeople > 0 ? totalGeneral / numPeople : 0;
    
    $('#total-general').text('€ ' + totalGeneral.toFixed(2));
    $('#total-people').text(numPeople);
    $('#average-person').text('€ ' + average.toFixed(2));
    
    $('#loading').hide();
    $('#summary-container').show();
    
    $('#totalsTable').DataTable({
        order: [[1, 'desc']],
        language: {
            search: "Cerca:",
            lengthMenu: "Mostra _MENU_ record per pagina",
            info: "Visualizzati da _START_ a _END_ di _TOTAL_ persone",
            infoEmpty: "Nessuna persona trovata",
            infoFiltered: "(filtrati da _MAX_ persone totali)",
            paginate: {
                first: "Primo",
                last: "Ultimo",
                next: "Successivo",
                previous: "Precedente"
            },
            zeroRecords: "Nessuna persona trovata"
        }
    });
    
    createChart(totals);
}

function createChart(totals) {
    const ctx = document.getElementById('totalsChart');
    
    // Prendi le prime 10 persone per il grafico
    const top10 = totals.slice(0, 10);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: top10.map(item => item.nome),
            datasets: [{
                label: 'Totale Importo (€)',
                data: top10.map(item => item.totale),
                backgroundColor: 'rgba(13, 110, 253, 0.5)',
                borderColor: 'rgba(13, 110, 253, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Top 10 Persone per Totale Importo'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '€ ' + value.toFixed(2);
                        }
                    }
                }
            }
        }
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
