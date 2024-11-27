async function lendBook() {
    const studentId = document.getElementById('selectedStudentId').value;
    const bookIsbn = document.getElementById('selectedBookIsbn').value;

    if (!studentId || !bookIsbn) {
        alert('Lütfen öğrenci ve kitap seçiniz!');
        return;
    }

    try {
        const student = await db.get('students', studentId);
        const book = await db.get('books', bookIsbn);

        if (!student || !book) {
            alert('Öğrenci veya kitap bulunamadı!');
            return;
        }

        if (book.status !== 'available') {
            alert('Bu kitap şu anda müsait değil!');
            return;
        }

        // Ödünç alma tarihi ve iade tarihini ayarla
        const lendDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(lendDate.getDate() + 15);

        const lending = {
            studentId,
            bookIsbn,
            lendDate: lendDate.toISOString(),
            dueDate: dueDate.toISOString(),
            status: 'borrowed'
        };

        await db.add('lendings', lending);
        book.status = 'borrowed';
        await db.update('books', book);

        alert('Kitap başarıyla ödünç verildi!');
        clearLendingForm();
        updateLendingsList();
    } catch (error) {
        console.error('Ödünç verme hatası:', error);
        alert('Ödünç verme işlemi sırasında bir hata oluştu!');
    }
}

async function returnBook(lendingId, bookIsbn) {
    try {
        const book = await db.get('books', bookIsbn);
        if (!book) {
            alert('Kitap bulunamadı!');
            return;
        }

        const lending = await db.get('lendings', lendingId);
        if (!lending) {
            alert('Ödünç kaydı bulunamadı!');
            return;
        }

        lending.status = 'returned';
        lending.returnDate = new Date().toISOString();
        await db.update('lendings', lending);

        book.status = 'available';
        await db.update('books', book);

        alert('Kitap başarıyla iade alındı!');
        updateLendingsList();
    } catch (error) {
        console.error('İade alma hatası:', error);
        alert('İade alma işlemi sırasında bir hata oluştu!');
    }
}

function clearLendingForm() {
    document.getElementById('lendingStudent').value = '';
    document.getElementById('lendingBook').value = '';
    document.getElementById('selectedStudentId').value = '';
    document.getElementById('selectedBookIsbn').value = '';
    document.getElementById('studentSuggestions').innerHTML = '';
    document.getElementById('bookSuggestions').innerHTML = '';
}

async function searchStudents(query) {
    if (!query) {
        document.getElementById('studentSuggestions').innerHTML = '';
        return;
    }

    try {
        const students = await db.getAll('students');
        const matches = students.filter(student =>
            student.name.toLowerCase().includes(query.toLowerCase()) ||
            student.number.includes(query)
        );

        const suggestions = document.getElementById('studentSuggestions');
        suggestions.innerHTML = '';

        matches.forEach(student => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = `${student.name} (${student.number})`;
            div.onclick = () => {
                document.getElementById('lendingStudent').value = student.name;
                document.getElementById('selectedStudentId').value = student.id;
                suggestions.innerHTML = '';
            };
            suggestions.appendChild(div);
        });
    } catch (error) {
        console.error('Öğrenci arama hatası:', error);
    }
}

async function searchBooks(query) {
    if (!query) {
        document.getElementById('bookSuggestions').innerHTML = '';
        return;
    }

    try {
        const books = await db.getAll('books');
        const matches = books.filter(book =>
            book.title.toLowerCase().includes(query.toLowerCase()) ||
            book.isbn.includes(query)
        );

        const suggestions = document.getElementById('bookSuggestions');
        suggestions.innerHTML = '';

        matches.forEach(book => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = `${book.title} (${book.isbn})`;
            div.onclick = () => {
                document.getElementById('lendingBook').value = book.title;
                document.getElementById('selectedBookIsbn').value = book.isbn;
                suggestions.innerHTML = '';
            };
            suggestions.appendChild(div);
        });
    } catch (error) {
        console.error('Kitap arama hatası:', error);
    }
}

async function searchLendings(query) {
    const lendingsList = document.getElementById('lendingsList');
    lendingsList.innerHTML = '';

    try {
        const lendings = await db.getAll('lendings');
        const filteredLendings = query
            ? lendings.filter(l => l.status === 'borrowed')
            : lendings;

        if (query) {
            const students = await db.getAll('students');
            const books = await db.getAll('books');

            const matchedLendings = filteredLendings.filter(lending => {
                const student = students.find(s => s.id === lending.studentId);
                const book = books.find(b => b.isbn === lending.bookIsbn);
                return student.name.toLowerCase().includes(query.toLowerCase()) ||
                    book.title.toLowerCase().includes(query.toLowerCase()) ||
                    student.number.includes(query) ||
                    book.isbn.includes(query);
            });
            await displayLendings(matchedLendings);
        } else {
            await displayLendings(filteredLendings);
        }
    } catch (error) {
        console.error('Ödünç arama hatası:', error);
    }
}

async function displayLendings(lendings) {
    const lendingsList = document.getElementById('lendingsList');
    const table = document.createElement('table');
    table.className = 'list-table';

    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Kitap</th>
            <th>Öğrenci</th>
            <th>Ödünç Tarihi</th>
            <th>İade Tarihi</th>
            <th>Durum</th>
            <th>İşlem</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    for (const lending of lendings) {
        const student = await db.get('students', lending.studentId);
        const book = await db.get('books', lending.bookIsbn);

        const lendDate = new Date(lending.lendDate);
        const dueDate = new Date(lending.dueDate);
        const isOverdue = new Date() > dueDate;

        const tr = document.createElement('tr');
        if (isOverdue && lending.status === 'borrowed') {
            tr.classList.add('overdue');
        }

        tr.innerHTML = `
            <td>${book.title}</td>
            <td>${student.name}</td>
            <td>${lendDate.toLocaleDateString('tr-TR')}</td>
            <td>${dueDate.toLocaleDateString('tr-TR')}</td>
            <td>${lending.status === 'borrowed' ? 'Ödünç Verildi' : 'İade Edildi'}</td>
            <td>
                ${lending.status === 'borrowed' 
                    ? `<button onclick="returnBook(${lending.id}, '${book.isbn}')" class="action-btn">İade Al</button>`
                    : `<span>${new Date(lending.returnDate).toLocaleDateString('tr-TR')}</span>`
                }
            </td>
        `;
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    lendingsList.appendChild(table);
}

async function updateLendingsList() {
    const searchQuery = document.getElementById('searchLendings').value;
    await searchLendings(searchQuery);
}
