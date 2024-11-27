async function createBackup() {
    try {
        const backup = {
            version: '1.0',
            date: new Date().toISOString(),
            data: {
                books: await db.getAll('books'),
                students: await db.getAll('students'),
                lendings: await db.getAll('lendings')
            }
        };

        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `library_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Yedekleme hatası:', error);
        alert('Yedekleme sırasında bir hata oluştu!');
    }
}

async function restoreBackup() {
    const fileInput = document.getElementById('restoreFile');
    const file = fileInput.files[0];
    if (!file) return;

    try {
        const text = await file.text();
        const backup = JSON.parse(text);

        // Mevcut verileri temizle
        const stores = ['books', 'students', 'lendings'];
        for (const store of stores) {
            const items = await db.getAll(store);
            for (const item of items) {
                await db.delete(store, item.id || item.isbn);
            }
        }

        // Yedekten verileri geri yükle
        for (const book of backup.data.books) {
            await db.add('books', book);
        }
        for (const student of backup.data.students) {
            await db.add('students', student);
        }
        for (const lending of backup.data.lendings) {
            await db.add('lendings', lending);
        }

        alert('Yedek başarıyla geri yüklendi!');
        updateBooksList();
        updateStudentsList();
        updateLendingsList();
    } catch (error) {
        console.error('Geri yükleme hatası:', error);
        alert('Yedek geri yüklenirken bir hata oluştu!');
    }
}