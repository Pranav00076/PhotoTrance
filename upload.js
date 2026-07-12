document.addEventListener('DOMContentLoaded', () => {
    // 1. Create the Upload Modal
    const modalHtml = `
    <div id="uploadModal" class="upload-modal" style="display: none;">
        <div class="modal-content">
            <span class="close-btn">&times;</span>
            <h2>Upload Image</h2>
            <form id="uploadForm">
                <input type="file" id="imageInput" accept="image/*" required>
                <select id="categorySelect" required>
                    <option value="" disabled selected>Select Category</option>
                    <option value="Photography">Photography</option>
                    <option value="Art">Art</option>
                </select>
                <button type="submit">Upload & Save</button>
            </form>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // 2. Attach Modal Logic to upload buttons
    const uploadModal = document.getElementById('uploadModal');
    const closeBtn = document.querySelector('.close-btn');

    document.querySelectorAll('.upload-trigger').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            uploadModal.style.display = 'flex';
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            uploadModal.style.display = 'none';
        });
    }

    // 3. Handle Form Submit
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fileInput = document.getElementById('imageInput');
            const categorySelect = document.getElementById('categorySelect');
            const file = fileInput.files[0];
            
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const base64String = event.target.result;
                    const newImage = {
                        id: Date.now(),
                        category: categorySelect.value,
                        src: base64String
                    };
                    
                    // Save to localStorage
                    let uploads = JSON.parse(localStorage.getItem('photoTranceUploads') || '[]');
                    uploads.unshift(newImage); // add to beginning
                    localStorage.setItem('photoTranceUploads', JSON.stringify(uploads));
                    
                    uploadModal.style.display = 'none';
                    uploadForm.reset();
                    
                    // Inject immediately if we are on the right page
                    renderImages();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 4. Render Images based on current page
    function renderImages() {
        const uploads = JSON.parse(localStorage.getItem('photoTranceUploads') || '[]');
        const currentPage = window.location.pathname;

        uploads.forEach(imgData => {
            // Check if it's already rendered
            if (document.getElementById(`upload-${imgData.id}`)) return;

            const imgEl = document.createElement('img');
            imgEl.src = imgData.src;
            imgEl.id = `upload-${imgData.id}`;

            let targetContainer = null;

            // Determine target container based on category and page
            if (currentPage.includes('index.html') || currentPage === '/' || currentPage.endsWith('PhotoTrance/')) {
                if (imgData.category === 'Photography' || imgData.category === 'Showcase') {
                     targetContainer = document.getElementById('Showcase');
                }
            } else if (currentPage.includes('art.html')) {
                if (imgData.category === 'Art') {
                     targetContainer = document.querySelector('.bigcont');
                }
            }

            if (targetContainer) {
                // Prepend so new images show up first!
                targetContainer.insertBefore(imgEl, targetContainer.firstChild);
            }
        });
    }

    renderImages();
});
