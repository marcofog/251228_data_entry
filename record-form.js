const API_KEY = 'AIzaSyD5jhqsIoxrN9tJSI6cZPdQRixuRPoeKsw';
const CLIENT_ID = '943563926240-21bqii6h34c4u4pblmog6ge4ruashgkh.apps.googleusercontent.com';
const SPREADSHEET_ID = '1s_IB0HrMduXacSU9xAyCqCuKH81i-Ut4U_FADFCIFNY';
const SHEET_NAME = 'Foglio1';

const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

let tokenClient;
let gapiInited = false;
let gisInited = false;

window.addEventListener('load', () => {
    gapiLoaded();
    gisLoaded();
});

function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    });
    gapiInited = true;
}

function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '',
    });
    gisInited = true;
}

document.getElementById('recordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!gapiInited || !gisInited) {
        showMessage('Inizializzazione in corso...', 'warning');
        return;
    }

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const messaggio = document.getElementById('messaggio').value;

    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            showMessage('Errore di autenticazione: ' + resp.error, 'danger');
            return;
        }
        await appendRow(nome, email, messaggio);
    };

    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
        tokenClient.requestAccessToken({prompt: ''});
    }
});

async function appendRow(nome, email, messaggio) {
    const timestamp = new Date().toLocaleString('it-IT');
    
    try {
        const response = await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:D`,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [[timestamp, nome, email, messaggio]]
            }
        });
        
        showMessage('✓ Record salvato con successo!', 'success');
        document.getElementById('recordForm').reset();
    } catch (err) {
        showMessage('✗ Errore nel salvataggio: ' + err.message, 'danger');
    }
}

function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${text}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    setTimeout(() => {
        const alert = messageDiv.querySelector('.alert');
        if (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    }, 5000);
}