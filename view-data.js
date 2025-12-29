// Sostituisci con l'URL CSV che hai copiato dal passo 1
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
            displayData(records);
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
        
        // Parse CSV tenendo conto delle virgolette
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
        
        if (values[0]) {
            records.push({
                timestamp: values[0],
                nome: values[1] || '',
                email: values[2] || '',
                messaggio: values[3] || ''
            });
        }
    }
    
    return records;
}

function displayData(records) {
    const tbody = $('#recordTable tbody');
    tbody.empty();
    
    records.forEach(record => {
        const row = `
            <tr>
                <td>${escapeHtml(record.timestamp)}</td>
                <td>${escapeHtml(record.nome)}</td>
                <td>${escapeHtml(record.email)}</td>
                <td>${escapeHtml(record.messaggio)}</td>
            </tr>
        `;
        tbody.append(row);
    });
    
    $('#loading').hide();
    $('#table-container').show();
    
    $('#recordTable').DataTable({
        order: [[0, 'desc']],
        language: {
            search: "Cerca:",
            lengthMenu: "Mostra _MENU_ record per pagina",
            info: "Visualizzati da _START_ a _END_ di _TOTAL_ record",
            infoEmpty: "Nessun record disponibile",
            infoFiltered: "(filtrati da _MAX_ record totali)",
            paginate: {
                first: "Primo",
                last: "Ultimo",
                next: "Successivo",
                previous: "Precedente"
            },
            zeroRecords: "Nessun record trovato"
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