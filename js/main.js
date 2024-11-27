// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', async () => {
    await db.init();
    updateBooksList();
    updateStudentsList();
    updateLendingsList();
});

// Sekme değiştirme fonksiyonu
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
}