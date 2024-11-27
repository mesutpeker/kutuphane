async function exportStudentsToExcel() {
    const students = await db.getAll('students');
    const worksheet = XLSX.utils.json_to_sheet(students.map(student => ({
        "Öğrenci No": student.number,
        "Ad Soyad": student.name,
        "Sınıf": student.class
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Öğrenciler");
    XLSX.writeFile(workbook, "ogrenci_listesi.xlsx");
}

async function exportBooksToExcel() {
    const books = await db.getAll('books');
    const worksheet = XLSX.utils.json_to_sheet(books.map(book => ({
        "Kitap Adı": book.title,
        "Yazar": book.author,
        "ISBN": book.isbn,
        "Durum": book.status === 'available' ? 'Müsait' : 'Ödünç Verildi'
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Kitaplar");
    XLSX.writeFile(workbook, "kitap_listesi.xlsx");
}

async function exportBorrowedBooksToExcel() {
    const lendings = await db.getAll('lendings');
    const students = await db.getAll('students');
    const books = await db.getAll('books');
    
    const borrowedBooks = lendings.filter(l => l.status === 'borrowed');
    
    const borrowedBooksReport = borrowedBooks.map(lending => {
        const student = students.find(s => s.id === lending.studentId);
        const book = books.find(b => b.isbn === lending.bookIsbn);
        return {
            "Kitap Adı": book.title,
            "Yazar": book.author,
            "Öğrenci": student.name,
            "Ödünç Alma Tarihi": new Date(lending.lendDate).toLocaleDateString('tr-TR')
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(borrowedBooksReport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ödünç Kitaplar");
    XLSX.writeFile(workbook, "odunc_kitaplar.xlsx");
}

async function exportReturnedBooksToExcel() {
    const lendings = await db.getAll('lendings');
    const students = await db.getAll('students');
    const books = await db.getAll('books');
    
    const returnedBooks = lendings.filter(l => l.status === 'returned');
    
    const returnedBooksReport = returnedBooks.map(lending => {
        const student = students.find(s => s.id === lending.studentId);
        const book = books.find(b => b.isbn === lending.bookIsbn);
        return {
            "Kitap Adı": book.title,
            "Yazar": book.author,
            "Öğrenci": student.name,
            "İade Tarihi": new Date(lending.returnDate).toLocaleDateString('tr-TR')
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(returnedBooksReport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "İade Kitaplar");
    XLSX.writeFile(workbook, "iade_kitaplar.xlsx");
}