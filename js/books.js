// Google Books API'den Kitap Bilgisi Çekme
async function fetchFromGoogleBooks(isbn) {
    try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
        const data = await response.json();
        if (data.totalItems > 0) {
            const book = data.items[0].volumeInfo;
            return {
                title: book.title || 'Bilinmiyor',
                author: book.authors ? book.authors.join(', ') : 'Bilinmiyor',
                isbn: isbn
            };
        } else {
            console.warn('Google Books API: Kitap bulunamadı.');
            return null;
        }
    } catch (error) {
        console.error('Google Books API hatası:', error);
        return null;
    }
}

// Open Library API'den Kitap Bilgisi Çekme
async function fetchFromOpenLibrary(isbn) {
    try {
        const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
        const data = await response.json();
        const bookKey = `ISBN:${isbn}`;
        if (data[bookKey]) {
            const book = data[bookKey];
            return {
                title: book.title || 'Bilinmiyor',
                author: book.authors ? book.authors.map(a => a.name).join(', ') : 'Bilinmiyor',
                isbn: isbn
            };
        } else {
            console.warn('Open Library API: Kitap bulunamadı.');
            return null;
        }
    } catch (error) {
        console.error('Open Library API hatası:', error);
        return null;
    }
}

// Kitap Bilgisi Alma (Google Books + Open Library)
async function fetchBookInfo(isbn) {
    // Önce Google Books API ile dene
    let bookInfo = await fetchFromGoogleBooks(isbn);
    if (bookInfo) return bookInfo;

    // Google Books başarısızsa Open Library API ile dene
    bookInfo = await fetchFromOpenLibrary(isbn);
    if (bookInfo) return bookInfo;

    // Hiçbir API'den bilgi alınamazsa
    alert('Kitap bilgisi bulunamadı. Lütfen ISBN numarasını kontrol edin.');
    return null;
}

// Barkod Okuma ve Kitap Arama
async function searchBook() {
    const isbn = document.getElementById('barcodeInput').value.trim();
    if (!isbn) return;

    try {
        // Kitap bilgilerini sıfırla
        document.getElementById('bookTitle').value = '';
        document.getElementById('bookAuthor').value = '';
        document.getElementById('bookISBN').value = isbn;

        // Kitap bilgilerini al (Google Books ve Open Library üzerinden)
        const bookInfo = await fetchBookInfo(isbn);
        if (bookInfo) {
            document.getElementById('bookTitle').value = bookInfo.title;
            document.getElementById('bookAuthor').value = bookInfo.author;
            document.getElementById('bookISBN').value = bookInfo.isbn;
        }
    } catch (error) {
        console.error('Kitap arama hatası:', error);
        alert('Kitap arama sırasında bir hata oluştu!');
    }
}

// Kitap Ekleme
document.getElementById('bookForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const book = {
        title: document.getElementById('bookTitle').value,
        author: document.getElementById('bookAuthor').value,
        isbn: document.getElementById('bookISBN').value,
        status: 'available'
    };

    try {
        await db.add('books', book);
        alert('Kitap başarıyla eklendi!');
        document.getElementById('bookForm').reset();
        updateBooksList();
    } catch (error) {
        console.error('Kitap ekleme hatası:', error);
        alert('Kitap eklenirken bir hata oluştu!');
    }
});

// Kitap Listesini Güncelleme
async function updateBooksList() {
    const booksList = document.getElementById('booksList');
    booksList.innerHTML = '';

    try {
        const books = await db.getAll('books');
        const table = document.createElement('table');
        table.className = 'list-table';
        
        // Tablo başlığı
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Kitap Adı</th>
                <th>Yazar</th>
                <th>ISBN</th>
                <th>Durum</th>
            </tr>
        `;
        table.appendChild(thead);

        // Tablo içeriği
        const tbody = document.createElement('tbody');
        books.forEach(book => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.isbn}</td>
                <td>${book.status === 'available' ? 'Müsait' : 'Ödünç Verildi'}</td>
            `;
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        booksList.appendChild(table);
    } catch (error) {
        console.error('Kitap listesi güncelleme hatası:', error);
    }
}
