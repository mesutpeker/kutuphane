async function importStudents() {
    const fileInput = document.getElementById('studentImport');
    const file = fileInput.files[0];
    if (!file) return;

    try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (data.type === 'students' && Array.isArray(data.data.students)) {
            for (const student of data.data.students) {
                await db.add('students', {
                    id: student.id,
                    number: student.number,
                    name: student.name,
                    class: student.class
                });
            }
            alert('Öğrenci listesi başarıyla içe aktarıldı!');
            updateStudentsList();
        }
    } catch (error) {
        console.error('Öğrenci içe aktarma hatası:', error);
        alert('Öğrenci listesi içe aktarılırken bir hata oluştu!');
    }
}

document.getElementById('studentForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const student = {
        id: Date.now().toString(),
        number: document.getElementById('studentNumber').value,
        name: document.getElementById('studentName').value,
        class: document.getElementById('studentClass').value
    };

    try {
        await db.add('students', student);
        alert('Öğrenci başarıyla eklendi!');
        document.getElementById('studentForm').reset();
        updateStudentsList();
    } catch (error) {
        console.error('Öğrenci ekleme hatası:', error);
        alert('Öğrenci eklenirken bir hata oluştu!');
    }
});

async function updateStudentsList() {
    const studentsList = document.getElementById('studentsList');
    studentsList.innerHTML = '';

    try {
        const students = await db.getAll('students');
        const table = document.createElement('table');
        table.className = 'list-table';
        
        // Tablo başlığı
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Öğrenci No</th>
                <th>Ad Soyad</th>
                <th>Sınıf</th>
            </tr>
        `;
        table.appendChild(thead);

        // Tablo içeriği
        const tbody = document.createElement('tbody');
        students.forEach(student => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${student.number}</td>
                <td>${student.name}</td>
                <td>${student.class}</td>
            `;
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        studentsList.appendChild(table);
    } catch (error) {
        console.error('Öğrenci listesi güncelleme hatası:', error);
    }
}