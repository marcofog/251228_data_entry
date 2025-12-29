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
    
    createChart(totals);
}