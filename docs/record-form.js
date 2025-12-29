// Sostituisci con l'URL del tuo Google Apps Script deployment
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbymWJKVh2anR9CjtWQI7wkLEU6eSwaP0FTbnDoLVdk0p-KqEAUcwXEL3iwNd34fv-m3/exec';

document.getElementById('recordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const messaggio = document.getElementById('messaggio').value;
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalHTML = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Invio...';
    
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nome: nome,
                email: email,
                messaggio: messaggio
            })
        });
        
        // Con no-cors non possiamo leggere la risposta, ma l'assenza di errore significa successo
        showMessage('✓ Record salvato con successo!', 'success');
        document.getElementById('recordForm').reset();
        
    } catch (error) {
        showMessage('✗ Errore nel salvataggio: ' + error.message, 'danger');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalHTML;
    }
});

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
            alert.remove();
        }
    }, 5000);
}