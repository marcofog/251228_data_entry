
## 3. Crea `view-data.js`

```javascript
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzOtM0iRcI7kjGXNlyaV-nCmCXQeQry10bJV9Q4PHXgZ7uDpuOehuCdEYLt0HS_GgIi/exec';

$(document).ready(function() {
    loadData();
});

async function loadData() {
    try {
        const response = await fetch(SCRIPT_URL + '?action=getData');
        
        if (!response.ok) {
            throw new Error('Errore nel recupero dei dati');
        }
        
        const data = await response.json();
        
        if (data.success && data.records) {
            displayData(data.records);
        } else {
            throw new Error(data.message || 'Nessun dato disponibile');
        }
        
    } catch (error) {
        showError('Errore nel caricamento dei dati: ' + error.message);
    }
}

function displayData(records) {
    const tbody = $('#recordTable tbody');
    tbody.empty();
    
    records.forEach(record => {
        const row = `
            <tr>
                <td>${record.timestamp}</td>
                <td>${record.nome}</td>
                <td>${record.importo}</td>
                <td>${record.nota}</td>
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

function showError(message) {
    $('#loading').hide();
    $('#error-message').text(message).show();
}
```